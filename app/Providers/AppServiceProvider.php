<?php

namespace App\Providers;

use App\Models\AdminOperation;
use App\Models\Batch;
use App\Models\Competition;
use App\Models\Exam;
use App\Models\Registration;
use App\Models\Stage;
use App\Models\Team;
use App\Policies\AdminOperationPolicy;
use App\Policies\BatchPolicy;
use App\Policies\CompetitionPolicy;
use App\Policies\ExamPolicy;
use App\Policies\RegistrationPolicy;
use App\Policies\StagePolicy;
use App\Policies\TeamPolicy;
use App\Repositories\AdminRepository;
use App\Repositories\AuthRepository;
use App\Repositories\BatchRepository;
use App\Repositories\CompetitionRepository;
use App\Repositories\Contracts\AdminRepositoryInterface;
use App\Repositories\Contracts\AuthRepositoryInterface;
use App\Repositories\Contracts\BatchRepositoryInterface;
use App\Repositories\Contracts\CompetitionRepositoryInterface;
use App\Repositories\Contracts\DashboardRepositoryInterface;
use App\Repositories\Contracts\FileRepositoryInterface;
use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Repositories\Contracts\TodoRepositoryInterface;
use App\Repositories\DashboardRepository;
use App\Repositories\FileRepository;
use App\Repositories\TeamRepository;
use App\Repositories\TodoRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AdminRepositoryInterface::class, AdminRepository::class);
        $this->app->bind(CompetitionRepositoryInterface::class, CompetitionRepository::class);
        $this->app->bind(BatchRepositoryInterface::class, BatchRepository::class);
        $this->app->bind(DashboardRepositoryInterface::class, DashboardRepository::class);
        $this->app->bind(AuthRepositoryInterface::class, AuthRepository::class);
        $this->app->bind(FileRepositoryInterface::class, FileRepository::class);
        $this->app->bind(TeamRepositoryInterface::class, TeamRepository::class);
        $this->app->bind(TodoRepositoryInterface::class, TodoRepository::class);
    }

    public function boot(): void
    {
        Gate::policy(Competition::class, CompetitionPolicy::class);
        Gate::policy(Batch::class, BatchPolicy::class);
        Gate::policy(AdminOperation::class, AdminOperationPolicy::class);
        Gate::policy(Exam::class, ExamPolicy::class);
        Gate::policy(Team::class, TeamPolicy::class);
        Gate::policy(Registration::class, RegistrationPolicy::class);
        Gate::policy(Stage::class, StagePolicy::class);

        RateLimiter::for('auth.register', fn (Request $request): array => [
            Limit::perMinute(3)->by($request->ip()),
            Limit::perHour(10)->by($request->ip()),
        ]);
        RateLimiter::for('auth.login', fn (Request $request): array => [
            Limit::perMinute(5)->by($this->emailIpKey($request)),
            Limit::perHour(20)->by($this->emailIpKey($request)),
        ]);
        RateLimiter::for('auth.forgot', fn (Request $request): array => [
            Limit::perMinutes(15, 3)->by($this->emailIpKey($request)),
            Limit::perHour(5)->by($this->emailIpKey($request)),
        ]);
        RateLimiter::for('auth.reset.verify', fn (Request $request): array => [
            Limit::perMinutes(15, 5)->by($this->emailIpKey($request)),
            Limit::perHour(20)->by($this->emailIpKey($request)),
        ]);
        RateLimiter::for('auth.reset.change', fn (Request $request): array => [
            Limit::perMinutes(15, 3)->by($request->ip()),
        ]);
        RateLimiter::for('auth.verify-email', fn (Request $request): array => [
            Limit::perMinutes(10, 5)->by((string) $request->user()?->getAuthIdentifier()),
        ]);
        RateLimiter::for('auth.verify-email.resend', fn (Request $request): array => [
            Limit::perMinute(1)->by((string) $request->user()?->getAuthIdentifier()),
            Limit::perHour(5)->by((string) $request->user()?->getAuthIdentifier()),
        ]);
        RateLimiter::for('auth.logout', fn (Request $request): Limit => Limit::perMinute(10)
            ->by((string) $request->user()?->getAuthIdentifier()));
    }

    private function emailIpKey(Request $request): string
    {
        return sha1(strtolower(trim((string) $request->input('email'))).'|'.$request->ip());
    }
}
