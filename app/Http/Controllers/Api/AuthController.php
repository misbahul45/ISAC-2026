<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Requests\Auth\VerifyResetCodeRequest;
use App\Http\Resources\AdminResource;
use App\Http\Resources\AuthResource;
use App\Http\Resources\TeamAuthResource;
use App\Models\Admin;
use App\Models\Team;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return $this->success('Akun team berhasil dibuat. Silakan cek email kamu untuk kode verifikasi.', [
            'token' => $result['token'], 'tokenType' => $result['tokenType'], 'principalType' => $result['principalType'],
            'team' => new AuthResource($result['team']), 'redirectTo' => $result['redirectTo'],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());
        $principal = $result['principalType'] === 'ADMIN'
            ? ['admin' => new AdminResource($result['admin'])]
            : ['team' => new AuthResource($result['team'])];
        $message = $result['emailVerificationRequired']
            ? 'Email belum diverifikasi. Kode verifikasi baru telah dikirim ke email kamu.'
            : 'Login berhasil';

        return $this->success($message, [
            'token' => $result['token'], 'tokenType' => $result['tokenType'], 'principalType' => $result['principalType'],
            ...$principal, 'redirectTo' => $result['redirectTo'],
            'emailVerificationRequired' => $result['emailVerificationRequired'],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $user instanceof Admin
            ? ['principalType' => 'ADMIN', 'admin' => new AdminResource($user)]
            : ['principalType' => 'TEAM', 'team' => new TeamAuthResource($user)];

        return $this->success('Data user berhasil diambil', $data);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->success('Logout berhasil', null);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgotPassword($request->validated());

        return $this->success('Kode reset password berhasil dikirim ke email', null);
    }

    public function verifyCode(VerifyResetCodeRequest $request): JsonResponse
    {
        return $this->success('Kode berhasil diverifikasi', [
            ...$this->authService->verifyCode($request->validated()),
            'redirectTo' => '/auth/reset-password',
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword($request->validated());

        return $this->success('Password berhasil diubah', null);
    }

    public function sendVerification(Request $request): JsonResponse
    {
        /** @var Team $team */
        $team = $request->user();
        $this->authService->sendVerificationCode($team);

        return $this->success('Kode verifikasi berhasil dikirim. Silakan cek email kamu.', null);
    }

    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        /** @var Team $team */
        $team = $request->user();
        $this->authService->verifyEmail($team, $request->validated());

        return $this->success('Email berhasil diverifikasi.', [
            'team' => new AuthResource($team->fresh()),
            'redirectTo' => '/registration',
        ]);
    }

    private function success(string $message, mixed $data, int $status = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success', 'message' => $message, 'data' => $data,
            'metadata' => (object) [], 'error' => null,
        ], $status);
    }
}
