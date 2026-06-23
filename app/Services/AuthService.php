<?php

namespace App\Services;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Support\Facades\DB;

class AuthService
{
    public function __construct(
        private readonly TeamRepositoryInterface $teamRepository,
    ) {
        //
    }

    /**
     * @param  array{email: string, password: string}  $data
     */
    public function register(array $data): Team
    {
        return DB::transaction(function () use ($data): Team {
            return $this->teamRepository->createTeam([
                'email' => $data['email'],
                'password' => $data['password'],
                'code' => $this->generateTeamCode(),
                'status' => 'registered',
            ]);
        });
    }

    /**
     * @param  array{email: string, password: string}  $credentials
     * @return array<string, mixed>
     */
    public function login(array $credentials): array
    {
        return [
            'status' => 'success',
            'message' => 'Login request validated successfully.',
            'data' => null,
        ];
    }

    private function generateTeamCode(): string
    {
        $count = Team::withTrashed()->count() + 1;

        return 'ISAC-TM-'.str_pad((string) $count, 3, '0', STR_PAD_LEFT);
    }
}
