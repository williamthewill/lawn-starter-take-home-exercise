<?php

namespace App\GraphQL\Resolvers;

/** 
 * Adjust the memory limit to 512MB,
 * required for multiple parallel HTTP requests,
 * especially when fetching movie characters in batches.
 */
ini_set('memory_limit', '512M');

use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;

class SwapiMoviesResolver
{
    /**
     * @return array
     * Fetch movies from the SWAPI API by title
     */
    public function all($root, array $args)
    {
        // Collect Garbage Cycles
        gc_collect_cycles();

        $title = $args['title'] ?? null;
        $response = Http::get('https://swapi.tech/api/films', ['title' => $title]);

        if ($response->failed()) {
            return [];
        }

        // The API returns an array in "results"
        $results = $response->json()["result"] ?? [];

        return collect($results)->map(function ($item) {
            return $this->normalizeMovie($item);
        })->toArray();

        return $response->json()["result"] ?? [];
    }

    /**
     * @return array
     * Fetch details of a specific movie from the SWAPI API by its UID
     */
    public function details($root, array $args)
    {
        $uid = $args['id'];
        $response = Http::get("https://swapi.tech/api/films/{$uid}");

        if ($response->failed()) {
            return [];
        }

        // The API returns the movie details in "result"
        $result = $response->json()["result"] ?? [];

        return $this->normalizeMovie($result) ?? [];
    }

    /**
     * @return array
     * Fetch the characters associated with a specific movie from the SWAPI API
     * Uses asynchronous HTTP requests to improve performance
     * Implements caching to reduce repeated calls
     * Returns a list of characters with name, URL, and UID
     */
    public function characters($root)
    {
        $urls = $root['charactersUrls'] ?? [];

        // Return empty if no URLs provided
        if (empty($urls)) {
            return [];
        }

        $client = new Client();

        /**
         * Define batch size for parallel requests.
         * A batch size of 5 is a good balance between performance and resource usage.
         * Larger batch sizes may lead to memory exhaustion or rate limiting by the API.
         * Adjust as necessary based on testing and server capabilities.
         */
        $batchSize = 5;
        $characters = [];

        // Check cache first
        $urlsToFetch = [];
        foreach ($urls as $url) {
            $cached = cache()->get("characters_" . md5($url));
            if ($cached) {
                $characters[$url] = $cached;
            } else {
                // If not in cache, add to fetch list
                $urlsToFetch[] = $url;
            }
        }

        // Process in batches
        foreach (array_chunk($urlsToFetch, $batchSize) as $batch) {
            // Create Promises only for characters not in cache
            $promises = []; 

            // Start asynchronous requests
            foreach ($batch as $url) {
                $promises[$url] = $client->getAsync($url);
            }

            // Wait for all requests in the batch to complete
            $responses = \GuzzleHttp\Promise\Utils::settle($promises)->wait();

            // Process responses and cache results
            foreach ($responses as $url => $res) {
                if ($res['state'] === 'fulfilled' && $res['value']->getStatusCode() === 200) {
                    $body = json_decode($res['value']->getBody(), true);
                    $character = [
                        'name' => $body['result']['properties']['name'],
                        'url' => $body['result']['properties']['url'],
                        'uid' => $body['result']['uid']
                    ];
                    $characters[$url] = $character;
                    cache()->put("characters_" . md5($url), $character, 3600); // Cache for 1 hour
                } else {
                    $characters[$url] = null;
                }

                unset($res); // Free memory
            }

            gc_collect_cycles(); // Collect Garbage Cycles
        }

        return $characters;
    }

    /**
     * @param array $item
     * @return array
     * Normalize movie data structure
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
