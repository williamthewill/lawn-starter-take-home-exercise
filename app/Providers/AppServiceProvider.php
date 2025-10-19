<?php

namespace App\Providers;

use App\Console\Commands\ProcessSchemasStats;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar o scheduler
        if ($this->app->runningInConsole()) {
            $schedule = $this->app->make(Schedule::class);
            $schedule->command(ProcessSchemasStats::class)->everyFiveMinutes();
        }
    }
}
