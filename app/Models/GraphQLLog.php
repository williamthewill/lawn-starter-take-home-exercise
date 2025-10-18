<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GraphQLLog extends Model
{
    protected $table = 'graphql_logs';
    
    protected $fillable = [
        'root_field',
        'operation',
        'duration',
        'headers',
        'body',
    ];

    protected $casts = [
        'headers' => 'array',
        'body' => 'array',
    ];
}
