<?php

namespace App\Services;

use App\Exceptions\InvalidCredentialException;
use App\Models\Team;
use App\Repositories\Contracts\AuthRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
        return DB::transaction(function () use ($data): Team {
            return $this->authRepository->createTeam([
                'email' => $data['email'],
                'password' => $data['password'],
                'code' => $this->generateTeamCode(),
                'status' => 'registered',
            ]);
        });
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

        $team->tokens()->delete();

        $token = $team->createToken('auth-token');

        return [
            'token' => $token->plainTextToken,
            'tokenType' => 'Bearer',
            'team' => $team,
        ];
    }

    private function generateTeamCode(): string
    {
        $count = Team::withTrashed()->count() + 1;

        return 'ISAC-TM-'.str_pad((string) $count, 3, '0', STR_PAD_LEFT);
    }
}
