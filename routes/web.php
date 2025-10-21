<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    /**
     * Render the SWAPI Search Page
     * This page allows users to search for Star Wars movies and characters.
     */
    return Inertia::render('SwapiSearch');
});

Route::get('/stats', function () {
    /**
     * Render the Statistics Page
     * This page displays statistics about GraphQL schema usage.
     */
    return Inertia::render('Statistics');
});


require __DIR__.'/settings.php';
