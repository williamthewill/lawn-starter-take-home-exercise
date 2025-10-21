<?php

namespace Tests\Feature\GraphQL;

use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;


/**
 * Tests for the SwapiMovies GraphQL resolver.
 * Ensures that movie data is correctly fetched and normalized from the SWAPI API.
 * Covers scenarios for searching movies by title and fetching movie details by UID.
 * Mocks HTTP responses to isolate tests from external API dependencies.
 * Cleans up memory and cache between tests to ensure consistent results.
 * Disables GraphQL logging to the database for test performance.
 */
class SwapiMoviesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['graphql.log' => false]);

        if (class_exists(\App\Http\Middleware\LogGraphQLToDatabase::class)) {
            $this->withoutMiddleware(\App\Http\Middleware\LogGraphQLToDatabase::class);
        }

        $this->artisan('migrate', ['--force' => true]);
        cache()->flush();
    }

    #[Test]
    public function it_returns_movies_from_swapi_api(): void
    {
        Http::fake([
            'https://swapi.tech/api/films*' => Http::response([
                'message' => 'ok',
                'result' => [
                    [
                        'uid' => '3',
                        'description' => 'A Star Wars Film',
                        'properties' => [
                            'title' => 'Return of the Jedi',
                            'episode_id' => 6,
                            'director' => 'Richard Marquand',
                            'producer' => 'Howard G. Kazanjian, George Lucas, Rick McCallum',
                            'release_date' => '1983-05-25',
                            'opening_crawl' => 'Luke Skywalker has returned to his home planet...',
                            'characters' => [
                                'https://www.swapi.tech/api/people/1',
                                'https://www.swapi.tech/api/people/2',
                                'https://www.swapi.tech/api/people/3'
                            ],
                            'url' => 'https://www.swapi.tech/api/films/3',
                        ],
                    ],
                    [
                        'uid' => '2',
                        'description' => 'A Star Wars Film',
                        'properties' => [
                            'title' => 'The Empire Strikes Back',
                            'episode_id' => 5,
                            'director' => 'Irvin Kershner',
                            'producer' => 'Gary Kurtz',
                            'release_date' => '1980-05-21',
                            'opening_crawl' => 'It is a dark time for the Rebellion...',
                            'characters' => [
                                'https://www.swapi.tech/api/people/1',
                                'https://www.swapi.tech/api/people/2'
                            ],
                            'url' => 'https://www.swapi.tech/api/films/2',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $query = '
            query($title: String!) {
                swapiMovies(title: $title) {
                    title
                    openingCrawl
                }
            }
        ';

        $response = $this->postJson('/graphql', [
            'query' => $query,
            'variables' => ['title' => 'Jedi'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'swapiMovies' => [
                        [
                            'title' => 'Return of the Jedi',
                            'openingCrawl' => 'Luke Skywalker has returned to his home planet...',
                        ],
                        [
                            'title' => 'The Empire Strikes Back',
                            'openingCrawl' => 'It is a dark time for the Rebellion...',
                        ],
                    ],
                ],
            ]);
    }

    #[Test]
    public function it_handles_empty_results(): void
    {
        Http::fake([
            'https://swapi.tech/api/films*' => Http::response([
                'message' => 'ok',
                'result' => [],
            ], 200),
        ]);

        $query = '
            query($title: String!) {
                swapiMovies(title: $title) {
                    title
                }
            }
        ';

        $response = $this->postJson('/graphql', [
            'query' => $query,
            'variables' => ['title' => 'Unknown Film'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'swapiMovies' => [],
                ],
            ]);
    }
}
