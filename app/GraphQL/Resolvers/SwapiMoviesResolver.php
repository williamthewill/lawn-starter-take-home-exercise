<?php

namespace App\GraphQL\Resolvers;

ini_set('memory_limit', '512M');

use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;

class SwapiMoviesResolver
{
    /**
     * @return array
     * Busca todos os filmes da API SWAPI
     */
    public function all($root, array $args)
    {
        // coletar ciclos de lixo
        gc_collect_cycles();

        $title = $args['title'] ?? null;
        $response = Http::get('https://swapi.tech/api/films', ['title' => $title]);

        if ($response->failed()) {
            return [];
        }

        // A API retorna um array em "results"
        $results = $response->json()["result"] ?? [];

        return collect($results)->map(function ($item) {
            return $this->normalizeMovie($item);
        })->toArray();

        // A API retorna um array em "results"
        return $response->json()["result"] ?? [];
    }

    /**
     * @return array
     * Busca detalhes de um filme específico da API SWAPI
     */
    public function details($root, array $args)
    {
        $uid = $args['id'];
        $response = Http::get("https://swapi.tech/api/films/{$uid}");

        if ($response->failed()) {
            return [];
        }

        // A API retorna um array em "results"
        $result = $response->json()["result"] ?? [];

        return $this->normalizeMovie($result) ?? [];
    }

    /**
     * @return array
     * Busca os personagens associados a um filme específico da API SWAPI
     */
    public function characters($root)
    {
        $urls = $root['charactersUrls'] ?? [];

        // Retorna vazio se não houver URLs
        if (empty($urls)) {
            return [];
        }

        $client = new Client();
        $batchSize = 5;  // número limitado de requisições paralelas
        $characters = [];

        // Separa URLs que ainda não estão em cache
        $urlsToFetch = [];
        foreach ($urls as $url) {
            $cached = cache()->get("characters_" . md5($url));
            if ($cached) {
                $characters[$url] = $cached;
            } else {
                $urlsToFetch[] = $url;
            }
        }

        foreach (array_chunk($urlsToFetch, $batchSize) as $batch) {
            $promises = []; // Criar Promises apenas para os characters que não estão em cache

            foreach ($batch as $url) {
                $promises[$url] = $client->getAsync($url);
            }

            // Resolver todas as Promises de uma vez
            $responses = \GuzzleHttp\Promise\Utils::settle($promises)->wait();

            // Processar respostas e salvar no cache
            foreach ($responses as $url => $res) {
                if ($res['state'] === 'fulfilled' && $res['value']->getStatusCode() === 200) {
                    $body = json_decode($res['value']->getBody(), true);
                    $character = [
                        'name' => $body['result']['properties']['name'],
                        'url' => $body['result']['properties']['url'],
                        'uid' => $body['result']['uid']
                    ];
                    $characters[$url] = $character;
                    cache()->put("characters_" . md5($url), $character, 3600); // Cache por 1 hora
                } else {
                    $characters[$url] = null;
                }

                unset($res); // liberar memória
            }

            gc_collect_cycles(); // coletar ciclos de lixo
        }

        // Retornar no formato esperado pelo GraphQL
        // return collect($urls)->map(fn($url) => ['name' => $characters[$url], 'url' => $url])->toArray();
        return $characters;
    }

    /**
     * @return array
     * Normaliza os dados de um filme da API SWAPI
     */
    private function normalizeMovie($item)
    {
        return [
            'uid' => $item['uid'],
            'url' => $item['properties']['url'],
            'title' => $item['properties']['title'] ?? 'Unknown',
            'charactersUrls' => $item['properties']['characters'],
            'openingCrawl' => $item['properties']['opening_crawl'] ?? 'Unknown',
        ];
    }
}
