<?php

// use App\Http\Controllers\SwapiController;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

Route::get('/', function () {
    return Inertia::render('SwapiSearch');
});

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');

    // // Rotas SWAPI protegidas dentro do dashboard
    // Route::prefix('/dashboard/swapi')->group(function () {
    //     Route::get('/people', [SwapiController::class, 'peopleList']);
    //     Route::get('/people/{id}', [SwapiController::class, 'personDetail']);
    //     Route::get('/movies/{id}', [SwapiController::class, 'movieDetail']);
    //     Route::get('/search/movies', [SwapiController::class, 'searchMovies']);
    //     Route::get('/search/people', [SwapiController::class, 'searchPeople']);
    // });
// });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
