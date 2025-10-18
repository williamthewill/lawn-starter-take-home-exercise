<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('graphql_logs', function (Blueprint $table) {
            $table->id();
            $table->string('root_field', 255)->nullable(); // Nome da query/mutation
            $table->string('operation', 255)->nullable();
            $table->float('duration'); // segundos
            $table->jsonb('headers')->nullable();
            $table->jsonb('body')->nullable(); // payload enviado
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('graphql_logs');
    }
};
