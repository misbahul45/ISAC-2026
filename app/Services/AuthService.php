<?php

namespace App\Services;

use App\Enums\AccountType;
use App\Enums\AuthChallengePurpose;
use App\Exceptions\InvalidCredentialException;
use App\Exceptions\InvalidResetPasswordException;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Models\Team;
use App\Repositories\Contracts\AuthRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        private readonly AuthRepositoryInterface $authRepository,
    ) {}

    public function register(array $data): Team
    {
        $team = DB::transaction(function () use ($data): Team {
            return $this->authRepository->createTeam([
                'email' => $data['email'],
                'password' => $data['password'],
                'code' => $this->generateTeamCode(),
                'status' => Team::STATUS_INCOMPLETE,
            ]);
        });

        $this->sendVerificationCode(['account_id' => $team->id]);

        return $team;
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
        ]);

        Mail::to($email)->send(new ResetPasswordMail($code));
    }

    public function verifyCode(array $data): array
    {
        $challenge = $this->authRepository->findValidChallenge(
            $data['account_id'],
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
        ]);

        return ['resetToken' => $resetToken];
    }

    public function changePassword(array $data): void
    {
        $challenge = $this->authRepository->findValidResetToken($data['resetToken']);

        if ($challenge === null) {
            throw new InvalidResetPasswordException('Sesi tidak valid atau sudah kadaluarsa.', 'INVALID_RESET_TOKEN');
        }

        $team = $this->authRepository->findByEmail($challenge->account_id);

        $teamFromId = Team::query()->find($challenge->account_id);

        if ($teamFromId === null) {
            throw new InvalidResetPasswordException('Team tidak ditemukan.', 'INVALID_RESET_TOKEN');
        }

        DB::transaction(function () use ($teamFromId, $challenge, $data): void {
            $this->authRepository->updateTeamPassword($teamFromId, $data['password']);
            $this->authRepository->markChallengeUsed($challenge);
        });
    }

    public function sendVerificationCode(array $data): void
    {
        $accountId = $data['account_id'];

        $team = Team::query()->find($accountId);

        if ($team === null) {
            throw new InvalidCredentialException('Team tidak ditemukan.');
        }

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
        ]);

        Mail::to($team->email)->send(new VerifyEmailMail($code));
    }

    public function verifyEmail(array $data): void
    {
        $challenge = $this->authRepository->findValidChallenge(
            $data['account_id'],
            AccountType::TEAM->value,
            AuthChallengePurpose::VERIFY_EMAIL,
            $data['code'],
        );

        if ($challenge === null) {
            throw new InvalidCredentialException('Kode verifikasi tidak valid atau sudah kadaluarsa.');
        }

        $team = Team::query()->find($data['account_id']);

        if ($team === null) {
            throw new InvalidCredentialException('Team tidak ditemukan.');
        }

        DB::transaction(function () use ($team, $challenge): void {
            $this->authRepository->markChallengeUsed($challenge);
            $this->authRepository->markTeamEmailAsVerified($team);
        });
    }

    private function generateTeamCode(): string
    {
        $count = Team::withTrashed()->count() + 1;

        return 'ISAC-TM-'.str_pad((string) $count, 3, '0', STR_PAD_LEFT);
    }
}
