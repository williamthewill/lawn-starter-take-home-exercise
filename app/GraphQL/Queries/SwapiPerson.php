<?php

namespace App\GraphQL\Queries;

use Illuminate\Support\Facades\Http;

class SwapiPerson
{
    public function resolve($_, array $args)
    {
        $id = $args['id'];
        $response = Http::get("https://swapi.tech/api/people/{$id}");

        if ($response->failed()) {
            return null;
        }

        // Retorna o objeto dentro de 'result.properties'
        return $response->json('result.properties') ?? null;
    }
}
