<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('SwapiSearch');
});

Route::get('/stats', function () {
    return Inertia::render('Statistics');
});


require __DIR__.'/settings.php';
// require __DIR__.'/auth.php'; 
