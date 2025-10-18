<?php

namespace App\Service;

use GuzzleHttp\Client;
use GuzzleHttp\Promise\Utils;
use Illuminate\Support\Facades\Http;

class SwapiService
{
    protected string $baseUrl = 'https://www.swapi.tech/api/';

    public function getPeople(int $page = 1): array
    {
        $response = Http::get($this->baseUrl . 'people/', ['page' => $page, 'limit' => 10]);

        if ($response->successful() && isset($response->json()['results'])) {
            return $response->json()["results"];
        }

        return [];
    }

    public function getPerson(int $id): array
    {
        $response = Http::get($this->baseUrl . 'people/' . $id);

        if ($response->successful() && isset($response->json()['result'])) {
            return $response->json()["result"];
        }

        return [];
    }

    public function getMovie(int $id): array
    {
        $response = Http::get($this->baseUrl . 'films/' . $id);

        if ($response->successful() && isset($response->json()['result'])) {
            return $response->json()["result"];
        }

        return [];
    }

    public function searchMovies(string $query): array
    {
        $response = Http::get($this->baseUrl . 'films/', ['name' => $query]);

        if ($response->successful() && isset($response->json()['results'])) {
            return $response->json()["results"];
        }

        return [];
    }

    public function searchPeople(string $query): array
    {
        $response = Http::get($this->baseUrl . 'people/', ['name' => 'bi']);

        if ($response->successful() && isset($response->json()['result'])) {
            $results = $response->json()["result"];

            $returner = array_map(function ($item) {
                return [
                    'uid' => $item['uid'],
                    'name' => $item['properties']['name'] ?? 'Unknown',
                    'movies' => $item['properties']['films'] ?? [],
                    'details' => [
                        'birth_year' => $item['properties']['birth_year'] ?? 'Unknown',
                        'gender' => $item['properties']['gender'] ?? 'Unknown',
                        'height' => $item['properties']['height'] ?? 'Unknown',
                        'mass' => $item['properties']['mass'] ?? 'Unknown',
                        'hair_color' => $item['properties']['hair_color'] ?? 'Unknown',
                        'eye_color' => $item['properties']['eye_color'] ?? 'Unknown',
                    ],
                ];
            }, $results);
            

            return $returner;
        }

        return [];
    }

    public function getAssyncData($urlList): array
    {
        $client = new Client();

        $promises = [];

        foreach ($urlList as $url) {
            $promises[] = $client->getAsync($url);
        }

        // Executa tudo em paralelo
        $responses = Utils::unwrap($promises);

        $results = [];
        foreach ($responses as $response) {
            $results[] = json_decode($response->getBody(), true);
        }

        return $results;
    }
}
