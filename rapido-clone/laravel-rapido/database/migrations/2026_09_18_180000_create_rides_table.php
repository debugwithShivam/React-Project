<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('rides')) {
            Schema::create('rides', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('driver_id')->nullable();
                $table->text('pickup_address');
                $table->decimal('pickup_lat', 10, 7)->nullable();
                $table->decimal('pickup_lng', 10, 7)->nullable();
                $table->text('dropoff_address');
                $table->decimal('dropoff_lat', 10, 7)->nullable();
                $table->decimal('dropoff_lng', 10, 7)->nullable();
                $table->string('vehicle_type', 50)->default('BIKE');
                $table->enum('status', ['SCHEDULED', 'SEARCHING', 'ACCEPTED', 'ARRIVING', 'STARTED', 'COMPLETED', 'CANCELLED'])->default('SEARCHING');
                $table->decimal('estimated_fare', 10, 2)->default(0);
                $table->decimal('final_fare', 10, 2)->nullable();
                $table->decimal('distance_km', 10, 2)->nullable();
                $table->integer('duration_min')->nullable();
                $table->string('start_otp', 6)->nullable();
                $table->enum('payment_method', ['CASH', 'ONLINE', 'WALLET'])->default('CASH');
                $table->enum('payment_status', ['PENDING', 'PAID', 'FAILED', 'REFUNDED'])->default('PENDING');
                $table->unsignedBigInteger('coupon_id')->nullable();
                $table->decimal('discount_amount', 10, 2)->default(0);
                $table->decimal('commission_amount', 10, 2)->default(0);
                $table->decimal('driver_earnings', 10, 2)->default(0);
                $table->decimal('cancellation_charges', 10, 2)->default(0);
                $table->enum('cancelled_by', ['USER', 'DRIVER', 'ADMIN', 'SYSTEM'])->nullable();
                $table->string('cancellation_reason', 255)->nullable();
                $table->boolean('is_scheduled')->default(false);
                $table->boolean('is_sos')->default(false);
                $table->dateTime('scheduled_at')->nullable();
                $table->dateTime('accepted_at')->nullable();
                $table->dateTime('arrived_at')->nullable();
                $table->dateTime('started_at')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->dateTime('cancelled_at')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'status']);
                $table->index(['driver_id', 'status']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rides');
    }
};
