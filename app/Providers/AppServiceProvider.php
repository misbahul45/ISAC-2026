<?php

namespace App\Providers;

use App\Repositories\Contracts\DashboardRepositoryInterface;
use App\Repositories\Contracts\AuthRepositoryInterface;
use App\Repositories\Contracts\FileRepositoryInterface;
use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Repositories\Contracts\TodoRepositoryInterface;
use App\Repositories\DashboardRepository;
use App\Repositories\AuthRepository;
use App\Repositories\FileRepository;
use App\Repositories\TeamRepository;
use App\Repositories\TodoRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(\App\Repositories\Contracts\CompetitionRepositoryInterface::class,
\App\Repositories\CompetitionRepository::class );
        $this->app->bind(\App\Repositories\Contracts\BatchRepositoryInterface::class,
\App\Repositories\BatchRepository::class);
        $this->app->bind(DashboardRepositoryInterface::class, DashboardRepository::class);
        $this->app->bind(AuthRepositoryInterface::class, AuthRepository::class);
        $this->app->bind(FileRepositoryInterface::class, FileRepository::class);
        $this->app->bind(TeamRepositoryInterface::class, TeamRepository::class);
        $this->app->bind(TodoRepositoryInterface::class, TodoRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
