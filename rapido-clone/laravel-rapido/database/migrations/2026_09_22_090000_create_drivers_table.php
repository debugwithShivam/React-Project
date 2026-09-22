<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('drivers')) {
            Schema::create('drivers', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->unique();
                $table->string('city', 100)->nullable();
                $table->string('vehicle_type', 50)->default('bike');
                $table->string('vehicle_model', 120)->nullable();
                $table->string('vehicle_plate', 40)->nullable();
                $table->string('driving_license', 60)->nullable();
                $table->string('aadhaar_number', 20)->nullable();
                $table->string('payout_upi', 150)->nullable();
                $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
                $table->string('rejection_reason', 500)->nullable();
                $table->boolean('is_online')->default(false);
                $table->decimal('current_lat', 10, 7)->nullable();
                $table->decimal('current_lng', 10, 7)->nullable();
                $table->dateTime('last_location_update')->nullable();
                $table->decimal('rating_avg', 3, 2)->default(0);
                $table->integer('rating_count')->default(0);
                $table->integer('total_rides')->default(0);
                $table->decimal('total_earnings', 12, 2)->default(0);
                $table->decimal('wallet_balance', 12, 2)->default(0);
                $table->string('fcm_token', 500)->nullable();
                $table->timestamps();

                $table->index(['status', 'is_online']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
