<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class FortifyServiceProvider extends ServiceProvider
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
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
       
    }
}
