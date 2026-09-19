<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('rides')) {
            Schema::create('rides', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('driver_id')->nullable();
                $table->string('pickup_title', 255);
                $table->text('pickup_address');
                $table->string('drop_title', 255);
                $table->text('drop_address');
                $table->string('vehicle_type', 50)->default('bike'); // bike, auto, cab_economy, cab_premium
                $table->string('distance', 50)->nullable();
                $table->string('duration', 50)->nullable();
                $table->decimal('fare', 10, 2);
                $table->string('otp', 10)->nullable();
                $table->enum('status', ['PENDING', 'ACCEPTED', 'ON_TRIP', 'COMPLETED', 'CANCELLED'])->default('PENDING');
                $table->string('payment_method', 50)->default('WALLET');
                $table->unsignedTinyInteger('rating')->nullable();
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rides');
    }
};
