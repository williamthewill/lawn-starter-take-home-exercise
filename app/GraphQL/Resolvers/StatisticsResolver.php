<?php

namespace App\GraphQL\Resolvers;

use Illuminate\Support\Facades\DB;

class StatisticsResolver
{

    public function stats($root, array $args)
    {
        $topFields = DB::table('schemas_stats_top_five')
            ->select('root_field', 'count', 'percentage', 'total', 'created_at')
            ->whereIn('id', function ($query) {
                $query->select(DB::raw('MAX(id)'))
                    ->from('schemas_stats_top_five')
                    ->groupBy('root_field');
            })
            ->orderByDesc('created_at')
            ->get();

        $AverageDuration = DB::table('schemas_stats_average_duration')
            ->select('root_field', 'average_duration', 'created_at')
            ->whereIn('id', function ($query) {
                $query->select(DB::raw('MAX(id)'))
                    ->from('schemas_stats_average_duration')
                    ->groupBy('root_field');
            })
            ->orderByDesc('created_at')
            ->get();

        $BusiestHourToday = DB::table('schemas_stats_most_popular_hour')
            ->select('hour', 'count', 'updated_at', 'created_at')
            ->orderByDesc('updated_at')
            ->get();
        return [
            'topFields' => $topFields,
            'AverageDuration' => $AverageDuration,
            'BusiestHourToday' => $BusiestHourToday,
        ];
    }
}
