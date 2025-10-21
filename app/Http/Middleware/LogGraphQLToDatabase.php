<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\GraphQLLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogGraphQLToDatabase
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If not a GraphQL request, skip logging
        if (!$request->is('graphql')) {
            return $next($request);
        }

        $start = microtime(true);
        $response = $next($request);
        $duration = microtime(true) - $start;

        $payload = $request->getContent(); // Get the raw request body
        $payloadArray = json_decode($payload, true); // Decode to array

        $queryString = $payloadArray['query'] ?? null; // Get the query string
        $rootField = $this->extractRootField($queryString);
        $operation = $payloadArray['operationName'] ?? null;

        GraphQLLog::create([
            'root_field' => $rootField,
            'operation'  => $operation,
            'duration'   => $duration,
            'headers'    => $request->headers->all(),
            'body'       => $payload,
        ]);

        return $response;
    }

    private function extractRootField(string $query): ?string
    {
        if (!$query) return null;

        // A simple regex to extract the first root field from the query
        if (preg_match('/(?:\s+\w+)?\s*\{\s*(\w+)/', $query, $matches)) {
            return $matches[1]; // ex: swapiMovie | swapiPeople | statistics
        }

        return null;
    }
}
