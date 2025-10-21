<?php

namespace Tests\Feature\GraphQL;

use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests for the SwapiPeople GraphQL resolver.
 * Ensures that people data is correctly fetched and normalized from the SWAPI API.
 * Covers scenarios for searching people by name.
 * Mocks HTTP responses to isolate tests from external API dependencies.
 * Cleans up memory and cache between tests to ensure consistent results.
 * Disables GraphQL logging to the database for test performance.
 */
class SwapiPeopleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['graphql.log' => false]);

        if (class_exists(\App\Http\Middleware\LogGraphQLToDatabase::class)) {
            $this->withoutMiddleware(\App\Http\Middleware\LogGraphQLToDatabase::class);
        }

        $this->artisan('migrate', ['--force' => true]);

        // Clear cache before each test
        cache()->flush();
    }

    #[Test]
    public function it_returns_people_from_swapi_api(): void
    {
        // Mock SWAPI API response
        Http::fake([
            'https://swapi.tech/api/people*' => Http::response([
                'result' => [
                    [
                        'uid' => '1',
                        'url' => 'https://swapi.tech/api/people/1',
                        'properties' => [
                            'name' => 'Luke Skywalker',
                            'gender' => 'male',
                            'birth_year' => '19BBY',
                        ],
                    ],
                    [
                        'uid' => '2',
                        'url' => 'https://swapi.tech/api/people/2',
                        'properties' => [
                            'name' => 'Leia Organa',
                            'gender' => 'female',
                            'birth_year' => '19BBY',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $query = '
            query($name: String!) {
                swapiPeople(name: $name) {
                    name
                    details {
                        gender
                        birthYear
                    }
                }
            }
        ';

        $response = $this->postJson('/graphql', [
            'query' => $query,
            'variables' => ['name' => 'Luke'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'swapiPeople' => [
                        [
                            'name' => 'Luke Skywalker',
                            'details' => [
                                'gender' => 'male',
                                'birthYear' => '19BBY',
                            ],
                        ],
                        [
                            'name' => 'Leia Organa',
                            'details' => [
                                'gender' => 'female',
                                'birthYear' => '19BBY',
                            ],
                        ],
                    ],
                ],
            ]);
    }

    #[Test]
    public function it_handles_empty_results(): void
    {
        Http::fake([
            'https://swapi.tech/api/people*' => Http::response([
                'results' => [],
            ], 200),
        ]);

        $query = '
            query($name: String!) {
                swapiPeople(name: $name) {
                    name
                    details {
                        gender
                        birthYear
                    }
                }
            }
        ';

        $response = $this->postJson('/graphql', [
            'query' => $query,
            'variables' => ['name' => 'Nobody'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'swapiPeople' => [],
                ],
            ]);
    }
}
