<?php

namespace App\GraphQL\Resolvers;

/**
 * Adjust the memory limit to 256MB,
 * required for multiple parallel HTTP requests,
 * especially when fetching character details in batches.
 */
ini_set('memory_limit', '256M');

use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;

class SwapiPeopleResolver
{
    /**
     * @return array
     * Fetch people from the SWAPI API by name
     */
    public function all($root, array $args)
    {
        $name = $args['name'] ?? null;
        $response = Http::get('https://swapi.tech/api/people', ['name' => $name]);

        // Return empty if the request failed
        if ($response->failed()) {
            return [];
        }

        $results = $response->json()["result"] ?? [];

        return collect($results)->map(function ($item) {
            $normalized = $this->normalizePerson($item);

            // Cache the normalized person data for 1 hour
            cache()->put("swapi_person_{$normalized['uid']}", $normalized, 3600);

            return $normalized;
        })->toArray();

        return $response->json()["result"] ?? [];
    }

    /**
     * @return array
     * Fetch details of a specific person from the SWAPI API by its UID
     */
    public function details($root, array $args)
    {
        $uid = $args['id'] ?? null;

        // Return null if no UID provided
        if ($uid === null) {
            return null;
        }

        // Check cache first
        return cache()->remember("swapi_person_{$uid}", 3600, function () use ($uid) {
            // If not in cache, fetch from API
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
     * Fetch the films associated with a specific person from the SWAPI API
     * Uses asynchronous HTTP requests to improve performance
     * Implements caching to reduce repeated calls
     * Returns a list of films with title, URL, and UID
     */
    public function films($root)
    {
        // Get film URLs from the person data
        $urls = $root['filmsUrls'] ?? [];

        // Return empty if no URLs provided
        if (empty($urls)) {
            return [];
        }

        // New Guzzle HTTP client
        $client = new Client();
        $films = [];

        $urlsToFetch = [];
        foreach ($urls as $url) {
            $cached = cache()->get("film_" . md5($url));
            if ($cached) {
                $films[$url] = $cached;
            } else {
                $urlsToFetch[] = $url;
            }
        }

        // Create Promises only for the movies that are not in cache
        $promises = [];
        foreach ($urlsToFetch as $url) {
            $promises[$url] = $client->getAsync($url);
        }

        // Wait for all requests to complete
        $responses = \GuzzleHttp\Promise\Utils::settle($promises)->wait();

        // Process responses and cache results
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
                cache()->put("film_" . md5($url), $film, 3600); // Cache for 1 hour
            } else {
                $films[$url] = null;
            }
        }

        // Free memory
        gc_collect_cycles(); 

        return $films;
    }

    /**
     * @param array $item
     * @return array
     * Normalize person data structure
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
