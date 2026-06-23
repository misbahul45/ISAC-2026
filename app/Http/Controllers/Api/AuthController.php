<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\TeamAuthResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {
        //
    }

    public function login(LoginRequest $request): JsonResponse
    {
        return response()->json($this->authService->login($request->validated()));
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $team = $this->authService->register($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Akun team berhasil dibuat',
            'data' => new TeamAuthResource($team),
            'metadata' => (object) [],
            'error' => null,
        ], 201);
    }
}
