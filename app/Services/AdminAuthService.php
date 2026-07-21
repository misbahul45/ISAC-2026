<?php

namespace App\Services;

use App\Exceptions\InvalidCredentialException;
use App\Models\Admin;
use App\Repositories\Contracts\AdminRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class AdminAuthService
{
    public function __construct(
        private readonly AdminRepositoryInterface $adminRepo,
    ) {
        //
    }

    /**
     * @param  array{email: string, password: string}  $credentials
     * @return array{token: string, tokenType: string, admin: Admin}
     */
    public function login(array $credentials): array
    {
        $admin = $this->adminRepo->findByEmail($credentials['email']);

        if ($admin === null || ! Hash::check($credentials['password'], (string) $admin->password)) {
            throw new InvalidCredentialException('Email atau password salah.');
        }

        if (! $admin->is_active) {
            throw new InvalidCredentialException('Akun admin tidak aktif.');
        }

        $admin->tokens()->delete();

        $token = $admin->createToken('admin-token');

        $admin->update(['last_login_at' => now()]);

        return [
            'token' => $token->plainTextToken,
            'tokenType' => 'Bearer',
            'admin' => $admin,
        ];
    }

    public function logout(Admin $admin): void
    {
        $admin->currentAccessToken()?->delete();
    }
}
