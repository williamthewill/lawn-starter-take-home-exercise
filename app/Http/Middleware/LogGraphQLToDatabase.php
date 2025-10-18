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
        // Só intercepta /graphql
        if (!$request->is('graphql')) {
            return $next($request);
        }

        $start = microtime(true);
        $response = $next($request);
        $duration = microtime(true) - $start;

        $payload = $request->getContent(); // string do corpo da requisição
        $payloadArray = json_decode($payload, true); // transforma em array

        $queryString = $payloadArray['query'] ?? null; // pega a query real
        $rootField = $this->extractRootField($queryString);
        $operation = $payloadArray['operationName'] ?? null;

        GraphQLLog::create([
            'root_field' => $rootField, // "swapiMovie"
            'operation'  => $operation,
            'duration'   => $duration,
            'headers'    => $request->headers->all(),
            'body'       => $payload, // ainda salvo como string
        ]);

        return $response;
    }

    private function extractRootField(string $query): ?string
    {
        if (!$query) return null;

        // Captura o primeiro campo após a abertura
        if (preg_match('/(?:\s+\w+)?\s*\{\s*(\w+)/', $query, $matches)) {
            return $matches[1]; // ex: swapiMovie
        }

        return null;
    }
}
