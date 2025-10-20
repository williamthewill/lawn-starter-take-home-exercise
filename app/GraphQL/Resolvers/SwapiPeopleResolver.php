<?php

namespace App\GraphQL\Resolvers;

ini_set('memory_limit', '256M');

use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;

class SwapiPeopleResolver
{
    /**
     * @return array
     * Busca todas as pessoas da API SWAPI
     */
    public function all($root, array $args)
    {
        $name = $args['name'] ?? null;
        $response = Http::get('https://swapi.tech/api/people', ['name' => $name]);

        if ($response->failed()) {
            return [];
        }

        $results = $response->json()["result"] ?? [];

        return collect($results)->map(function ($item) {
            $normalized = $this->normalizePerson($item);

            // Cache individual por UID
            cache()->put("swapi_person_{$normalized['uid']}", $normalized, 3600);

            return $normalized;
        })->toArray();

        // A API retorna um array em "results"
        return $response->json()["result"] ?? [];
    }

    /**
     * @return array
     * Busca detalhes de uma pessoa específica da API SWAPI
     */
    public function details($root, array $args)
    {
        $uid = $args['id'] ?? null;

        if ($uid === null) {
            return null;
        }

        return cache()->remember("swapi_person_{$uid}", 3600, function () use ($uid) {
            $response = Http::get("https://swapi.tech/api/people/{$uid}");

            if ($response->failed()) {
                return [];
            }

            $result = $response->json()["result"] ?? [];

            return $this->normalizePerson($result) ?? [];
        });
    }

    /**
     * @return array
     * Busca os filmes associados a uma pessoa específica da API SWAPI
     */
    public function films($root)
    {
        $urls = $root['filmsUrls'] ?? [];

        if (empty($urls)) {
            return [];
        }

        $client = new Client();
        $films = [];

        // Separa URLs que ainda não estão em cache
        $urlsToFetch = [];
        foreach ($urls as $url) {
            $cached = cache()->get("film_" . md5($url));
            if ($cached) {
                $films[$url] = $cached;
            } else {
                $urlsToFetch[] = $url;
            }
        }

        // Criar Promises apenas para os filmes que não estão em cache
        $promises = [];
        foreach ($urlsToFetch as $url) {
            $promises[$url] = $client->getAsync($url);
        }

        // Resolver todas as Promises de uma vez
        $responses = \GuzzleHttp\Promise\Utils::settle($promises)->wait();

        // Processar respostas e salvar no cache
        foreach ($responses as $url => $res) {
            if ($res['state'] === 'fulfilled' && $res['value']->getStatusCode() === 200) {
                $body = json_decode($res['value']->getBody(), true);
                $film = [
                    'title' => $body['result']['properties']['title'],
                    'url' => $body['result']['properties']['url'],
                    'uid' => $body['result']['uid'],
                    'openingCrawl' => $body['result']['properties']['opening_crawl'],
                ];
                $films[$url] = $film;
                cache()->put("film_" . md5($url), $film, 3600); // Cache por 1 hora
            } else {
                $films[$url] = null;
            }
        }

        gc_collect_cycles(); // coletar ciclos de lixo

        // Retornar no formato esperado pelo GraphQL
        return $films;
    }

    /**
     * @return array
     * Normaliza os dados de uma pessoa da API SWAPI
     */
    private function normalizePerson(array $item)
    {
        $props = $item['properties'] ?? [];

        return [
            'uid' => $item['uid'],
            'url' => $props['url'] ?? $item['url'] ?? 'Unknown',
            'name' => $props['name'] ?? 'Unknown',
            'filmsUrls' => $item['properties']['films'] ?? 'Unknown',
            'details' => [
                'birthYear' => $props['birth_year'] ?? 'Unknown',
                'gender' => $props['gender'] ?? 'Unknown',
                'height' => $props['height'] ?? 'Unknown',
                'mass' => $props['mass'] ?? 'Unknown',
                'hairColor' => $props['hair_color'] ?? 'Unknown',
                'eyeColor' => $props['eye_color'] ?? 'Unknown',
            ],
        ];
    }
}
