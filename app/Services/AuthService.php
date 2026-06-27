<?php

namespace App\Services;

use App\Exceptions\InvalidCredentialException;
use App\Exceptions\InvalidResetPasswordException;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
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
    ) {
        //
    }

    /**
     * @param  array{email: string, password: string}  $data
     */
    public function register(array $data): Team
    {
        $team = DB::transaction(function () use ($data): Team {
            return $this->authRepository->createTeam([
                'email' => $data['email'],
                'password' => $data['password'],
                'code' => $this->generateTeamCode(),
                'status' => Team::STATUS_EMAIL_UNVERIFIED,
            ]);
        });

        $this->sendVerificationCode(['email' => $team->email]);

        return $team;
    }

    /**
     * @param  array{email: string, password: string}  $credentials
     * @return array{token: string, tokenType: string, team: Team}|null
     */
    public function login(array $credentials): ?array
    {
        $team = $this->authRepository->findByEmail($credentials['email']);

        if ($team === null || ! Hash::check($credentials['password'], (string) $team->password)) {
            throw new InvalidCredentialException("Email atau password salah");
        }

        if ($team->status === Team::STATUS_EMAIL_UNVERIFIED) {
            throw new InvalidCredentialException("Email belum diverifikasi. Silakan cek email kamu.");
        }

        $team->tokens()->delete();

        $token = $team->createToken('auth-token');

        return [
            'token' => $token->plainTextToken,
            'tokenType' => 'Bearer',
            'team' => $team,
        ];
    }

    public function logout(Team $team): void
    {
        $team->currentAccessToken()?->delete();
    }

    public function forgotPassword(array $data): array
    {
        $email = $data['email'];

        $this->authRepository->deleteOldResetCodes($email);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->authRepository->createResetCode([
            'email'      => $email,
            'code'       => $code,
            'expired_at' => now()->addMinutes(5),
        ]);

        Mail::to($email)->send(new ResetPasswordMail($code));

        return ['email' => $email];
    }

    public function verifyCode(array $data): array
    {
        $resetCode = $this->authRepository->findValidResetCode($data['email'], $data['code']);

        if ($resetCode === null) {
            throw new InvalidResetPasswordException('Kode OTP tidak valid atau sudah kadaluarsa.', 'INVALID_OTP');
        }

        $resetToken = Str::random(64);

        $this->authRepository->markCodeAsVerified($resetCode, $resetToken);

        return ['resetToken' => $resetToken];
    }

    public function changePassword(array $data): void
    {
        $resetCode = $this->authRepository->findValidResetToken($data['resetToken']);

        if ($resetCode === null) {
            throw new InvalidResetPasswordException('Sesi tidak valid atau sudah kadaluarsa.', 'INVALID_RESET_TOKEN');
        }

        $team = $this->authRepository->findByEmail($resetCode->email);

        if ($team === null) {
            throw new InvalidResetPasswordException('Team tidak ditemukan.', 'INVALID_RESET_TOKEN');
        }

        DB::transaction(function () use ($team, $resetCode, $data): void {
            $this->authRepository->updateTeamPassword($team, $data['password']);
            $this->authRepository->markTokenAsUsed($resetCode);
            $team->tokens()->delete();
        });
    }

    public function forgotPassword(array $data): array
    {
        $email = $data['email'];

        $this->authRepository->deleteOldResetCodes($email);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->authRepository->createResetCode([
            'email'      => $email,
            'code'       => $code,
            'expired_at' => now()->addMinutes(5),
        ]);

        Mail::to($email)->send(new ResetPasswordMail($code));

        return ['email' => $email];
    }

    public function verifyCode(array $data): array
    {
        $resetCode = $this->authRepository->findValidResetCode($data['email'], $data['code']);

        if ($resetCode === null) {
            throw new InvalidResetPasswordException('Kode OTP tidak valid atau sudah kadaluarsa.', 'INVALID_OTP');
        }

        $resetToken = Str::random(64);

        $this->authRepository->markCodeAsVerified($resetCode, $resetToken);

        return ['resetToken' => $resetToken];
    }

    public function changePassword(array $data): void
    {
        $resetCode = $this->authRepository->findValidResetToken($data['resetToken']);

        if ($resetCode === null) {
            throw new InvalidResetPasswordException('Sesi tidak valid atau sudah kadaluarsa.', 'INVALID_RESET_TOKEN');
        }

        $team = $this->authRepository->findByEmail($resetCode->email);

        if ($team === null) {
            throw new InvalidResetPasswordException('Team tidak ditemukan.', 'INVALID_RESET_TOKEN');
        }

        DB::transaction(function () use ($team, $resetCode, $data): void {
            $this->authRepository->updateTeamPassword($team, $data['password']);
            $this->authRepository->markTokenAsUsed($resetCode);
            $team->tokens()->delete();
        });
    }

    private function generateTeamCode(): string
    {
        $count = Team::withTrashed()->count() + 1;

        return 'ISAC-TM-'.str_pad((string) $count, 3, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array{email: string}  $data
     */
    public function sendVerificationCode(array $data): void
    {
        $email = $data['email'];

        $team = $this->authRepository->findByEmail($email);

        if ($team === null) {
            throw new InvalidCredentialException('Email tidak ditemukan.');
        }

        if ($team->status !== Team::STATUS_EMAIL_UNVERIFIED) {
            throw new InvalidCredentialException('Email sudah diverifikasi.');
        }

        $this->authRepository->deleteOldVerificationCodes($email);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->authRepository->createResetCode([
            'email'      => $email,
            'code'       => $code,
            'type'       => 'verify_email',
            'expired_at' => now()->addMinutes(5),
        ]);

        Mail::to($email)->send(new VerifyEmailMail($code));
    }

    /**
     * @param  array{email: string, code: string}  $data
     */
    public function verifyEmail(array $data): void
    {
        $resetCode = $this->authRepository->findValidVerificationCode(
            $data['email'],
            $data['code'],
        );

        if ($resetCode === null) {
            throw new InvalidCredentialException('Kode verifikasi tidak valid atau sudah kadaluarsa.');
        }

        $team = $this->authRepository->findByEmail($data['email']);

        if ($team === null) {
            throw new InvalidCredentialException('Team tidak ditemukan.');
        }

        DB::transaction(function () use ($team, $resetCode): void {
            $this->authRepository->markTokenAsUsed($resetCode);
            $this->authRepository->updateTeamStatus($team, Team::STATUS_ACTIVE);
        });
    }
}
