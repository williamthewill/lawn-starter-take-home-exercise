<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProcessSchemasStats extends Command
{
    protected $signature = 'schemas:process';
    protected $description = 'Calcula os 5 root_fields mais usados e salva na tabela schemas_stats mantendo histórico, com logs';

    public function handle(): void
    {
        $schedulerLog = storage_path('logs/scheduler_debug.log');
        // Log de início
        file_put_contents($schedulerLog, "=== Rodando ProcessSchemasStats: " . now() . " ===\n", FILE_APPEND);

        $this->topSchemas($schedulerLog);
        $this->calculateAverageDuration($schedulerLog);
        $this->calculateBusiestHourToday($schedulerLog);

        file_put_contents($schedulerLog, "Processamento concluído.\n\n", FILE_APPEND);
    }

    private function topSchemas($schedulerLog)
    {
        // Pega os 5 root_fields mais usados
        $topFields = DB::table('graphql_logs')
            ->select('root_field', DB::raw('COUNT(*) as count'))
            ->whereNotNull('root_field')
            ->groupBy('root_field')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        if ($topFields->isEmpty()) {
            file_put_contents($schedulerLog, "Nenhum root_field encontrado nesta rodada.\n\n", FILE_APPEND);
            return;
        }

        $totalTop = $topFields->sum('count');

        foreach ($topFields as $field) {
            $percentage = ($field->count / $totalTop) * 100;

            try {
                // Insere novo registro na tabela schemas_stats (histórico)
                DB::table('schemas_stats_top_five')->insert([
                    'root_field' => $field->root_field,
                    'count' => $field->count,
                    'percentage' => round($percentage, 2),
                    'total' => $totalTop,
                    'created_at' => now()
                ]);
            } catch (\Exception $e) {
                // Log do erro sem interromper o loop
                file_put_contents(
                    $schedulerLog,
                    "Erro ao inserir {$field->root_field}: " . $e->getMessage() . "\n",
                    FILE_APPEND
                );
            }
        }

        file_put_contents($schedulerLog, "=== topSchemas finalizado: " . now() . " ===\n", FILE_APPEND);
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
            file_put_contents($schedulerLog, "Nenhum root_field encontrado para calcular duração média.\n", FILE_APPEND);
            return;
        }

        foreach ($rootFields as $field) {
            try {
                // Calcula a média de duration para o root_field
                $avgDuration = DB::table('graphql_logs')
                    ->where('root_field', $field)
                    ->avg('duration');

                // Salva na mesma tabela schemas_stats como histórico
                DB::table('schemas_stats_average_duration')->insert([
                    'root_field' => $field,
                    'average_duration' => round($avgDuration, 4), // segundos
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                file_put_contents(
                    $schedulerLog,
                    "Erro ao calcular duração média de {$field}: " . $e->getMessage() . "\n",
                    FILE_APPEND
                );
            }
        }
        file_put_contents($schedulerLog, "=== calculateAverageDuration finalizado: " . now() . " ===\n", FILE_APPEND);
    }

    /**
     * Calcula a hora mais popular do dia corrente e atualiza na tabela schemas_stats_most_popular_hour
     */
    private function calculateBusiestHourToday($schedulerLog): void
    {
        $today = now()->toDateString(); // YYYY-MM-DD

        try {
            // Agrupa por hora apenas do dia corrente (PostgreSQL usa EXTRACT)
            $hourlyCounts = DB::table('graphql_logs')
                ->selectRaw('EXTRACT(HOUR FROM created_at) AS hour, COUNT(*) AS total')
                ->whereDate('created_at', $today)
                ->groupByRaw('EXTRACT(HOUR FROM created_at)')
                ->orderByDesc('total')
                ->get();

            if ($hourlyCounts->isEmpty()) {
                file_put_contents($schedulerLog, "Nenhum registro encontrado hoje ({$today}) para calcular hora mais popular.\n", FILE_APPEND);
                return;
            }

            $busiestHour = $hourlyCounts->first();

            // Atualiza ou cria registro do dia corrente
            DB::table('schemas_stats_most_popular_hour')->updateOrInsert(
                ['created_at' => $today], // usa a data do dia como chave
                [
                    'count' => $busiestHour->total,
                    'hour' => $busiestHour->hour,
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            file_put_contents(
                $schedulerLog,
                "Erro ao calcular hora mais popular hoje ({$today}): " . $e->getMessage() . "\n",
                FILE_APPEND
            );
        }

        file_put_contents($schedulerLog, "=== calculateBusiestHourToday finalizado: " . now() . " ===\n", FILE_APPEND);
    }
}
