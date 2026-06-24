<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\AuthResource;
use App\Http\Resources\TeamAuthResource;
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
            'message' => 'Akun team berhasil dibuat',
            'data' => new AuthResource($team),
            'metadata' => (object) [],
            'error' => null,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'data' => [
                'token' => $result['token'],
                'tokenType' => $result['tokenType'],
                'team' => new AuthResource($result['team']),
            ],
            'metadata' => (object) [],
            'error' => null,
        ], 200);
    }

    public function me(Request $request): JsonResponse
    {
        $team = $request->user();

        return response()->json([
            'status' => 'success',
            'message' => 'Data user berhasil diambil',
            'data' => new TeamAuthResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $team = $request->user();

        $this->authService->logout($team);

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
        $result = $this->authService->forgotPassword($request->validated());

        return response()->json([
            'status'   => 'success',
            'message'  => 'Kode reset password berhasil dikirim ke email',
            'data'     => $result,
            'metadata' => (object) [],
            'error'    => null,
        ]);
    }



}
