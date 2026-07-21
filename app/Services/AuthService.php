<?php

namespace App\Services;

use App\Enums\AccountType;
use App\Enums\AuthChallengePurpose;
use App\Exceptions\InvalidCredentialException;
use App\Exceptions\InvalidResetPasswordException;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Models\Admin;
use App\Models\Team;
use App\Repositories\Contracts\AuthRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        private readonly AuthRepositoryInterface $authRepository,
    ) {}

    public function register(array $data): array
    {
        $team = DB::transaction(function () use ($data): Team {
            return $this->authRepository->createTeam([
                'email' => $data['email'],
                'password' => $data['password'],
                'code' => $this->generateTeamCode(),
                'status' => Team::STATUS_INCOMPLETE,
            ]);
        });

        $this->sendVerificationCode($team);

        $token = $team->createToken('auth-token');

        return [
            'token' => $token->plainTextToken,
            'tokenType' => 'Bearer',
            'principalType' => 'TEAM',
            'team' => $team,
            'redirectTo' => '/registration',
        ];
    }

    public function login(array $data): array
    {
        $email = strtolower(trim($data['email']));

        $team = $this->authRepository->findByEmail($email);
        $admin = $this->authRepository->findAdminByEmail($email);

        if ($team !== null && $admin !== null) {
            throw new InvalidCredentialException('Akun ambigu. Gunakan email yang berbeda untuk Team dan Admin.', 409);
        }

        if ($admin !== null) {
            if (! Hash::check($data['password'], (string) $admin->password)) {
                throw new InvalidCredentialException('Email atau password salah.');
            }

            if (! $admin->is_active) {
                throw new InvalidCredentialException('Akun admin tidak aktif.', 403);
            }

            $admin->tokens()->delete();
            $token = $admin->createToken('auth-token');

            $admin->update(['last_login_at' => now()]);

            return [
                'token' => $token->plainTextToken,
                'tokenType' => 'Bearer',
                'principalType' => 'ADMIN',
                'admin' => $admin,
                'redirectTo' => '/admin/dashboard',
            ];
        }

        if ($team !== null) {
            if (! Hash::check($data['password'], (string) $team->password)) {
                throw new InvalidCredentialException('Email atau password salah.');
            }

            if (! $team->isEmailVerified()) {
                throw new InvalidCredentialException('Email belum diverifikasi.', 401);
            }

            $team->tokens()->delete();
            $token = $team->createToken('auth-token');

            return [
                'token' => $token->plainTextToken,
                'tokenType' => 'Bearer',
                'principalType' => 'TEAM',
                'team' => $team,
                'redirectTo' => $team->next_redirect,
            ];
        }

        throw new InvalidCredentialException('Email atau password salah.');
    }

    public function logout(Team|Admin $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    public function forgotPassword(array $data): void
    {
        $email = $data['email'];
        $team = $this->authRepository->findByEmail($email);

        if ($team === null) {
            return;
        }

        $this->authRepository->invalidateChallenges(
            $team->id,
            AccountType::TEAM->value,
            AuthChallengePurpose::RESET_PASSWORD,
        );

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->authRepository->createChallenge([
            'account_type' => AccountType::TEAM,
            'account_id' => $team->id,
            'purpose' => AuthChallengePurpose::RESET_PASSWORD,
            'code_hash' => bcrypt($code),
            'expired_at' => now()->addMinutes(5),
            'sent_at' => now(),
        ]);

        Mail::to($email)->send(new ResetPasswordMail($code));
    }

    public function verifyCode(array $data): array
    {
        $email = $data['email'];
        $team = $this->authRepository->findByEmail($email);

        if ($team === null) {
            throw new InvalidResetPasswordException('Kode OTP tidak valid atau sudah kadaluarsa.', 'INVALID_OTP');
        }

        $challenge = $this->authRepository->findValidChallenge(
            $team->id,
            AccountType::TEAM->value,
            AuthChallengePurpose::RESET_PASSWORD,
            $data['code'],
        );

        if ($challenge === null) {
            throw new InvalidResetPasswordException('Kode OTP tidak valid atau sudah kadaluarsa.', 'INVALID_OTP');
        }

        $resetToken = Str::random(64);

        $challenge->update([
            'verified_at' => now(),
            'expired_at' => now()->addMinutes(10),
            'reset_token_hash' => bcrypt($resetToken),
        ]);

        return ['resetToken' => $resetToken];
    }

    public function changePassword(array $data): void
    {
        $challenge = $this->authRepository->findValidResetToken($data['resetToken']);

        if ($challenge === null) {
            throw new InvalidResetPasswordException('Sesi tidak valid atau sudah kadaluarsa.', 'INVALID_RESET_TOKEN');
        }

        $team = Team::query()->find($challenge->account_id);

        if ($team === null) {
            throw new InvalidResetPasswordException('Team tidak ditemukan.', 'INVALID_RESET_TOKEN');
        }

        DB::transaction(function () use ($team, $challenge, $data): void {
            $this->authRepository->updateTeamPassword($team, $data['password']);
            $this->authRepository->markChallengeUsed($challenge);
            $team->tokens()->delete();
        });
    }

    public function sendVerificationCode(Team $team): void
    {
        if ($team->isEmailVerified()) {
            throw new InvalidCredentialException('Email sudah diverifikasi.');
        }

        $this->authRepository->invalidateChallenges(
            $team->id,
            AccountType::TEAM->value,
            AuthChallengePurpose::VERIFY_EMAIL,
        );

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->authRepository->createChallenge([
            'account_type' => AccountType::TEAM,
            'account_id' => $team->id,
            'purpose' => AuthChallengePurpose::VERIFY_EMAIL,
            'code_hash' => bcrypt($code),
            'expired_at' => now()->addMinutes(5),
            'sent_at' => now(),
        ]);

        Mail::to($team->email)->send(new VerifyEmailMail($code));
    }

    public function verifyEmail(Team $team, array $data): void
    {
        $challenge = $this->authRepository->findValidChallenge(
            $team->id,
            AccountType::TEAM->value,
            AuthChallengePurpose::VERIFY_EMAIL,
            $data['code'],
        );

        if ($challenge === null) {
            throw new InvalidCredentialException('Kode verifikasi tidak valid atau sudah kadaluarsa.');
        }

        DB::transaction(function () use ($team, $challenge): void {
            $this->authRepository->markChallengeUsed($challenge);
            $this->authRepository->markTeamEmailAsVerified($team);
        });
    }

    private function generateTeamCode(): string
    {
        return DB::transaction(function (): string {
            $result = DB::table('teams')
                ->select(DB::raw('MAX(CAST(SUBSTRING(code, 10) AS UNSIGNED)) AS max_code'))
                ->lockForUpdate()
                ->get();
            $next = ((int) ($result[0]->max_code ?? 0)) + 1;

            return 'ISAC-TM-'.str_pad((string) $next, 3, '0', STR_PAD_LEFT);
        });
    }
}
