<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\SendVerificationRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Requests\VerifyCodeRequest;
use App\Http\Resources\AdminResource;
use App\Http\Resources\AuthResource;
use App\Http\Resources\TeamAuthResource;
use App\Models\Admin;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {
        //
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $team = $this->authService->register($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Akun team berhasil dibuat. Silakan cek email kamu untuk kode verifikasi.',
            'data' => new AuthResource($team),
            'metadata' => (object) [],
            'error' => null,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        $userData = $result['principalType'] === 'ADMIN'
            ? ['admin' => new AdminResource($result['admin'])]
            : ['team' => new AuthResource($result['team'])];

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'data' => [
                'token' => $result['token'],
                'tokenType' => $result['tokenType'],
                'principalType' => $result['principalType'],
                ...$userData,
                'redirectTo' => $result['redirectTo'],
            ],
            'metadata' => (object) [],
            'error' => null,
        ], 200);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $user instanceof Admin
            ? ['principalType' => 'ADMIN', 'admin' => new AdminResource($user)]
            : ['principalType' => 'TEAM', 'team' => new TeamAuthResource($user)];

        return response()->json([
            'status' => 'success',
            'message' => 'Data user berhasil diambil',
            'data' => $data,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil',
            'data' => null,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgotPassword($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Kode reset password berhasil dikirim ke email',
            'data' => null,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function verifyCode(VerifyCodeRequest $request): JsonResponse
    {
        $result = $this->authService->verifyCode($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Kode berhasil diverifikasi',
            'data' => $result,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diubah',
            'data' => null,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function sendVerification(SendVerificationRequest $request): JsonResponse
    {
        $this->authService->sendVerificationCode($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Kode verifikasi berhasil dikirim. Silakan cek email kamu.',
            'data' => null,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $this->authService->verifyEmail($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Email berhasil diverifikasi.',
            'data' => null,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
