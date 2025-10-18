<?php

namespace App\GraphQL\Queries;

use Illuminate\Support\Facades\Http;

class SwapiPeople
{
    public function resolve($_, array $args)
    {
        $response = Http::get('https://swapi.tech/api/people');

        if ($response->failed()) {
            return [];
        }

        // A API retorna um array em "results"
        return $response->json('results') ?? [];
    }
}
