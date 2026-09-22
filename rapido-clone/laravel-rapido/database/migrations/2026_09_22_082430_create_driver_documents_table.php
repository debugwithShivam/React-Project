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
        if (! Schema::hasTable('driver_documents')) {
            Schema::create('driver_documents', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('driver_id');
                $table->string('document_type', 50);
                $table->string('document_side', 20)->default('FRONT');
                $table->string('file_name', 255);
                $table->longBlob('file_data');
                $table->string('verification_status', 20)->default('PENDING');
                $table->timestamps();

                $table->index(['driver_id', 'document_type']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_documents');
    }
};
