<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TodoController;
use Illuminate\Support\Facades\Route;

Route::get('/system/status', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'ISAC-2026 API is running',
        'data' => [
            'app' => config('app.name'),
            'environment' => app()->environment(),
            'backend' => 'Laravel',
            'frontend' => 'React TypeScript',
            'query' => 'TanStack Query',
            'database' => config('database.default'),
            'timestamp' => now()->toISOString(),
        ],
    ]);
});

Route::get('/todos', [TodoController::class, 'index']);
Route::post('/todos', [TodoController::class, 'store']);
Route::patch('/todos/{todo}', [TodoController::class, 'update']);
Route::delete('/todos/{todo}', [TodoController::class, 'destroy']);

Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

Route::prefix('teams')->middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', [TeamController::class, 'show']);
    Route::patch('/me', [TeamController::class, 'update']);
});

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-code', [AuthController::class, 'verifyCode']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/send-verification', [AuthController::class, 'sendVerification']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});
