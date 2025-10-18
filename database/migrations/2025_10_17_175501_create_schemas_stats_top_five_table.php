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
        Schema::create('schemas_stats_top_five', function (Blueprint $table) {
            $table->id();
            $table->string('root_field');
            $table->integer('count');
            $table->decimal('percentage', 5, 2);
            $table->integer('total');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schemas_stats_top_five');
    }
};
