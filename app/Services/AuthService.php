<?php

namespace App\Services;

class AuthService
{
    /**
     * @param array{email: string, password: string} $credentials
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

    /**
     * @param array{name: string, email: string, password: string} $data
     * @return array<string, mixed>
     */
    public function register(array $data): array
    {
        return [
            'status' => 'success',
            'message' => 'Register request validated successfully.',
            'data' => null,
        ];
    }
}
