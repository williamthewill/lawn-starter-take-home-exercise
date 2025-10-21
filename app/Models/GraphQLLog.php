<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model representing a log entry for GraphQL requests.
 * Stores details such as root field, operation name, duration, headers, and body.
 * Mapped to the 'graphql_logs' database table.
 */
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
