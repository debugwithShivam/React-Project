<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Additive, idempotent v2 columns on core tables. Mirrors DATABASE_MIGRATION_v2.sql
 * so an existing rapido_clone DB and a fresh `migrate` end up identical.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'wallet_balance')) {
                $table->decimal('wallet_balance', 12, 2)->default(0)->after('is_active');
            }
            if (! Schema::hasColumn('users', 'rating_avg')) {
                $table->decimal('rating_avg', 3, 2)->default(0);
            }
            if (! Schema::hasColumn('users', 'rating_count')) {
                $table->integer('rating_count')->default(0);
            }
            if (! Schema::hasColumn('users', 'referral_code')) {
                $table->string('referral_code', 20)->nullable();
            }
            if (! Schema::hasColumn('users', 'fcm_token')) {
                $table->string('fcm_token', 500)->nullable();
            }
            if (! Schema::hasColumn('users', 'city')) {
                $table->string('city', 100)->nullable();
            }
        });

        if (Schema::hasTable('drivers')) {
            Schema::table('drivers', function (Blueprint $table) {
                foreach ([
                    'is_online' => fn () => $table->boolean('is_online')->default(false),
                    'current_lat' => fn () => $table->decimal('current_lat', 10, 7)->nullable(),
                    'current_lng' => fn () => $table->decimal('current_lng', 10, 7)->nullable(),
                    'last_location_update' => fn () => $table->dateTime('last_location_update')->nullable(),
                    'rating_avg' => fn () => $table->decimal('rating_avg', 3, 2)->default(0),
                    'rating_count' => fn () => $table->integer('rating_count')->default(0),
                    'total_rides' => fn () => $table->integer('total_rides')->default(0),
                    'total_earnings' => fn () => $table->decimal('total_earnings', 12, 2)->default(0),
                    'wallet_balance' => fn () => $table->decimal('wallet_balance', 12, 2)->default(0),
                    'fcm_token' => fn () => $table->string('fcm_token', 500)->nullable(),
                    'rejection_reason' => fn () => $table->string('rejection_reason', 500)->nullable(),
                ] as $column => $def) {
                    if (! Schema::hasColumn('drivers', $column)) {
                        $def();
                    }
                }
            });
        }
    }

    public function down(): void
    {
        // Additive migration — intentionally left non-destructive.
    }
};
