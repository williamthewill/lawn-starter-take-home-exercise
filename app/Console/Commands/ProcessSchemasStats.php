<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProcessSchemasStats extends Command
{
    protected $signature = 'schemas:process';
    protected $description = 'Processing schema statistics from GraphQL logs';

    public function handle(): void
    {
        $schedulerLog = storage_path('logs/scheduler_debug.log');

        file_put_contents($schedulerLog, "=== Running ProcessSchemasStats: " . now() . " ===\n", FILE_APPEND);

        $this->topSchemas($schedulerLog);
        $this->calculateAverageDuration($schedulerLog);
        $this->calculateBusiestHourToday($schedulerLog);

        file_put_contents($schedulerLog, "Processing Completed.\n\n", FILE_APPEND);
    }

    private function topSchemas($schedulerLog)
    {
        // Fetch the 5 most used root_fields
        $topFields = DB::table('graphql_logs')
            ->select('root_field', DB::raw('COUNT(*) as count'))
            ->whereNotNull('root_field')
            ->groupBy('root_field')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        if ($topFields->isEmpty()) {
            file_put_contents($schedulerLog, "No root_field found in this run.\n\n", FILE_APPEND);
            return;
        }

        $totalTop = $topFields->sum('count');

        foreach ($topFields as $field) {
            $percentage = ($field->count / $totalTop) * 100;

            try {
                // Insert new record into the schemas_stats table (history)
                DB::table('schemas_stats_top_five')->insert([
                    'root_field' => $field->root_field,
                    'count' => $field->count,
                    'percentage' => round($percentage, 2),
                    'total' => $totalTop,
                    'created_at' => now()
                ]);
            } catch (\Exception $e) {
                // Log the error without interrupting the loop
                file_put_contents(
                    $schedulerLog,
                    "Error inserting record {$field->root_field}: " . $e->getMessage() . "\n",
                    FILE_APPEND
                );
            }
        }

        file_put_contents($schedulerLog, "=== topSchemas completed: " . now() . " ===\n", FILE_APPEND);
    }

    /**
     * Calcula o tempo médio de resposta por root_field e salva na tabela schemas_stats
     */
    private function calculateAverageDuration($schedulerLog): void
    {
        // Pega os root_fields distintos
        $rootFields = DB::table('graphql_logs')
            ->select('root_field')
            ->whereNotNull('root_field')
            ->distinct()
            ->pluck('root_field');

        if ($rootFields->isEmpty()) {
            file_put_contents($schedulerLog, "No root_field found to calculate average duration.\n", FILE_APPEND);
            return;
        }

        foreach ($rootFields as $field) {
            try {
                // Calculate the average duration for the root_field
                $avgDuration = DB::table('graphql_logs')
                    ->where('root_field', $field)
                    ->avg('duration');

                // Save to the schemas_stats_average_duration table
                DB::table('schemas_stats_average_duration')->insert([
                    'root_field' => $field,
                    'average_duration' => round($avgDuration, 4), // segundos
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                file_put_contents(
                    $schedulerLog,
                    "Error calculating average duration for {$field}: " . $e->getMessage() . "\n",
                    FILE_APPEND
                );
            }
        }
        file_put_contents($schedulerLog, "=== calculateAverageDuration completed: " . now() . " ===\n", FILE_APPEND);
    }

    /**
     * Calculate the most popular hour of the current day and update the schemas_stats_most_popular_hour table
     */
    private function calculateBusiestHourToday($schedulerLog): void
    {
        $today = now()->toDateString(); // YYYY-MM-DD

        try {
            // Group by hour only for the current day
            $hourlyCounts = DB::table('graphql_logs')
                ->selectRaw('EXTRACT(HOUR FROM created_at) AS hour, COUNT(*) AS total')
                ->whereDate('created_at', $today)
                ->groupByRaw('EXTRACT(HOUR FROM created_at)')
                ->orderByDesc('total')
                ->get();

            if ($hourlyCounts->isEmpty()) {
                file_put_contents($schedulerLog, "No records found today ({$today}) to calculate the most popular hour.\n", FILE_APPEND);
                return;
            }

            $busiestHour = $hourlyCounts->first();

            // Update or create record for the current day
            DB::table('schemas_stats_most_popular_hour')->updateOrInsert(
                ['created_at' => $today], // Use the current date as the key
                [
                    'count' => $busiestHour->total,
                    'hour' => $busiestHour->hour,
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            file_put_contents(
                $schedulerLog,
                "Error calculating most popular hour today ({$today}): " . $e->getMessage() . "\n",
                FILE_APPEND
            );
        }

        file_put_contents($schedulerLog, "=== calculateBusiestHourToday completed: " . now() . " ===\n", FILE_APPEND);
    }
}
