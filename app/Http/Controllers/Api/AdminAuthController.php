<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Http\Resources\AdminResource;
use App\Services\AdminAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuthController extends Controller
{
    public function __construct(
        private readonly AdminAuthService $adminAuthService,
    ) {
        //
    }

    public function login(AdminLoginRequest $request): JsonResponse
    {
        $result = $this->adminAuthService->login($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil.',
            'data' => [
                'token' => $result['token'],
                'tokenType' => $result['tokenType'],
                'admin' => new AdminResource($result['admin']),
            ],
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Data admin berhasil diambil.',
            'data' => new AdminResource($request->user()),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->adminAuthService->logout($request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil.',
            'data' => null,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
