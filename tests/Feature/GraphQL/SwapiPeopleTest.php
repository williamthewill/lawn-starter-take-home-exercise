<?php

namespace Tests\Feature\GraphQL;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

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

        // 🔥 Limpa qualquer cache anterior (importante!)
        cache()->flush();
    }

    /** @test */
    public function it_returns_people_from_swapi_api(): void
    {
        // Mocka endpoint correto da swapi.tech
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

    /** @test */
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
