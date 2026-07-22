<?php

use App\Http\Controllers\Api\AdminRegistrationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\CompetitionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\ImageKitAuthController;
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

Route::get('/dashboard/summary', [DashboardController::class, 'summary'])->middleware(['auth:sanctum', 'principal.team', 'team.verified']);

Route::prefix('teams')->middleware(['auth:sanctum', 'principal.team', 'team.verified'])->group(function (): void {
    Route::get('/me', [TeamController::class, 'show']);
    Route::patch('/me', [TeamController::class, 'update']);
});

Route::prefix('files')->middleware(['auth:sanctum', 'upload.principal'])->group(function (): void {
    Route::post('/', [FileController::class, 'store']);
    Route::get('/{file}', [FileController::class, 'show'])->name('files.show');
});

Route::get('/imagekit-auth', [ImageKitAuthController::class, 'auth'])
    ->middleware(['auth:sanctum', 'upload.principal']);

Route::get('/competitions', [CompetitionController::class, 'index']);
Route::get('/competitions/open', [CompetitionController::class, 'open']);
Route::get('/competitions/{competition}', [CompetitionController::class, 'show'])->whereUuid('competition');

Route::prefix('admin')->middleware(['auth:admins', 'principal.admin'])->group(function (): void {
    Route::get('/teams', [AdminRegistrationController::class, 'index']);
    Route::get('/teams/{team}', [AdminRegistrationController::class, 'show'])->whereUuid('team');
    Route::post('/teams/{team}/verify', [AdminRegistrationController::class, 'verifyTeam'])->whereUuid('team');
    Route::post('/teams/{team}/revision', [AdminRegistrationController::class, 'reviseTeam'])->whereUuid('team');
    Route::post('/teams/{team}/reject', [AdminRegistrationController::class, 'rejectTeam'])->whereUuid('team');
    Route::post('/registrations/{registration}/payment/verify', [AdminRegistrationController::class, 'verifyPayment'])->whereUuid('registration');
    Route::post('/registrations/{registration}/payment/revision', [AdminRegistrationController::class, 'revisePayment'])->whereUuid('registration');
    Route::post('/registrations/{registration}/payment/reject', [AdminRegistrationController::class, 'rejectPayment'])->whereUuid('registration');
    Route::post('/teams/{team}/stages/{stage}/advance', [AdminRegistrationController::class, 'advanceStage'])->whereUuid(['team', 'stage']);
    Route::post('/competitions', [CompetitionController::class, 'store']);
    Route::patch('/competitions/{competition}', [CompetitionController::class, 'update']);
    Route::delete('/competitions/{competition}', [CompetitionController::class, 'destroy']);

    Route::prefix('batches')->group(function (): void {
        Route::get('/', [BatchController::class, 'index']);
        Route::post('/', [BatchController::class, 'store']);
        Route::get('/{batch}', [BatchController::class, 'show']);
        Route::patch('/{batch}', [BatchController::class, 'update']);
        Route::delete('/{batch}', [BatchController::class, 'destroy']);
    });
});

Route::prefix('registrations')->middleware(['auth:sanctum', 'principal.team', 'team.verified'])->group(function (): void {
    Route::get('/me/context', [RegistrationController::class, 'context']);
    Route::post('/me/selection', [RegistrationController::class, 'selection']);
    Route::get('/me/team', [RegistrationController::class, 'getTeam']);
    Route::patch('/me/team', [RegistrationController::class, 'updateTeam']);
    Route::get('/me/members', [RegistrationController::class, 'getMembers']);
    Route::put('/me/members', [RegistrationController::class, 'updateMembers']);
    Route::get('/me/documents', [RegistrationController::class, 'getDocuments']);
    Route::patch('/me/documents', [RegistrationController::class, 'updateDocuments']);
    Route::get('/me/payment', [RegistrationController::class, 'getPayment']);
    Route::post('/me/payment/quote', [RegistrationController::class, 'quotePayment']);
    Route::post('/me/payment', [RegistrationController::class, 'submitPayment']);
    Route::get('/me/summary', [RegistrationController::class, 'summary']);
    Route::post('/me/submit-verification', [RegistrationController::class, 'submitVerification']);
});

Route::get('/competitions/{competition}/batches/open', [BatchController::class, 'openForCompetition']);

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth.register');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth.login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth.forgot');
    Route::post('/reset-password/verify', [AuthController::class, 'verifyCode'])->middleware('throttle:auth.reset.verify');
    Route::post('/reset-password', [AuthController::class, 'changePassword'])->middleware('throttle:auth.reset.change');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('throttle:auth.logout');
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/verify-email/resend', [AuthController::class, 'sendVerification'])->middleware(['principal.team', 'throttle:auth.verify-email.resend']);
        Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->middleware(['principal.team', 'throttle:auth.verify-email']);
    });
});
