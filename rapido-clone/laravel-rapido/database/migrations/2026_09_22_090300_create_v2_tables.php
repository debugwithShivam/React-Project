<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Creates the v2 tables from DATABASE_MIGRATION_v2.sql (guarded) and seeds
 * default vehicle types, cities, settings and dynamic pages idempotently.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('vehicle_types')) {
            Schema::create('vehicle_types', function (Blueprint $table) {
                $table->id();
                $table->string('code', 20)->unique();
                $table->string('name', 50);
                $table->string('description', 255)->nullable();
                $table->string('icon_url', 500)->nullable();
                $table->integer('capacity')->default(1);
                $table->decimal('base_fare', 10, 2)->default(30);
                $table->decimal('per_km_fare', 10, 2)->default(8);
                $table->decimal('per_min_fare', 10, 2)->default(1.5);
                $table->decimal('minimum_fare', 10, 2)->default(30);
                $table->decimal('cancellation_fee', 10, 2)->default(10);
                $table->decimal('commission_percent', 5, 2)->default(15);
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('cities')) {
            Schema::create('cities', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100)->unique();
                $table->string('state', 100)->nullable();
                $table->string('country', 100)->default('India');
                $table->decimal('center_lat', 10, 7)->nullable();
                $table->decimal('center_lng', 10, 7)->nullable();
                $table->decimal('radius_km', 6, 2)->default(25);
                $table->boolean('is_active')->default(true);
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (! Schema::hasTable('coupons')) {
            Schema::create('coupons', function (Blueprint $table) {
                $table->id();
                $table->string('code', 40)->unique();
                $table->string('description', 255)->nullable();
                $table->enum('discount_type', ['FLAT', 'PERCENT'])->default('FLAT');
                $table->decimal('discount_value', 10, 2);
                $table->decimal('max_discount', 10, 2)->nullable();
                $table->decimal('min_fare', 10, 2)->default(0);
                $table->dateTime('valid_from');
                $table->dateTime('valid_until');
                $table->integer('usage_limit')->default(0);
                $table->integer('per_user_limit')->default(1);
                $table->integer('used_count')->default(0);
                $table->string('applicable_vehicle_types', 255)->nullable();
                $table->string('applicable_roles', 50)->default('USER');
                $table->boolean('is_active')->default(true);
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('coupon_redemptions')) {
            Schema::create('coupon_redemptions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('coupon_id');
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('ride_id')->nullable();
                $table->decimal('discount_amount', 10, 2);
                $table->timestamp('redeemed_at')->useCurrent();
            });
        }

        if (! Schema::hasTable('ratings')) {
            Schema::create('ratings', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ride_id');
                $table->unsignedBigInteger('rater_id');
                $table->unsignedBigInteger('ratee_id');
                $table->enum('rater_role', ['USER', 'DRIVER']);
                $table->unsignedTinyInteger('rating');
                $table->string('comment', 500)->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->unique(['ride_id', 'rater_id'], 'uniq_rating');
            });
        }

        if (! Schema::hasTable('complaints')) {
            Schema::create('complaints', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('ride_id')->nullable();
                $table->string('subject', 200);
                $table->text('description');
                $table->string('category', 50)->default('GENERAL');
                $table->enum('priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT'])->default('MEDIUM');
                $table->enum('status', ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])->default('OPEN');
                $table->unsignedBigInteger('assigned_to')->nullable();
                $table->text('resolution')->nullable();
                $table->dateTime('resolved_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('title', 200);
                $table->text('body');
                $table->string('type', 50)->default('GENERAL');
                $table->json('data_json')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamp('sent_at')->useCurrent();
                $table->dateTime('read_at')->nullable();
                $table->index(['user_id', 'is_read'], 'idx_user_read');
            });
        }

        if (! Schema::hasTable('wallet_transactions')) {
            Schema::create('wallet_transactions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->decimal('amount', 12, 2);
                $table->enum('type', ['CREDIT', 'DEBIT']);
                $table->string('reason', 100);
                $table->string('reference_type', 50)->nullable();
                $table->unsignedBigInteger('reference_id')->nullable();
                $table->decimal('balance_after', 12, 2);
                $table->timestamp('created_at')->useCurrent();
                $table->index(['user_id', 'created_at'], 'idx_user_created');
            });
        }

        if (! Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ride_id')->nullable();
                $table->unsignedBigInteger('user_id');
                $table->decimal('amount', 10, 2);
                $table->enum('method', ['CASH', 'RAZORPAY', 'WALLET']);
                $table->enum('status', ['INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'])->default('INITIATED');
                $table->string('gateway_order_id', 100)->nullable();
                $table->string('gateway_payment_id', 100)->nullable();
                $table->string('gateway_signature', 255)->nullable();
                $table->decimal('refund_amount', 10, 2)->default(0);
                $table->string('failure_reason', 255)->nullable();
                $table->dateTime('paid_at')->nullable();
                $table->timestamps();
                $table->index('gateway_order_id', 'idx_gateway_order');
            });
        }

        if (! Schema::hasTable('payouts')) {
            Schema::create('payouts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('driver_id');
                $table->decimal('amount', 12, 2);
                $table->string('upi', 150);
                $table->enum('status', ['REQUESTED', 'PROCESSING', 'PAID', 'REJECTED'])->default('REQUESTED');
                $table->string('reference_number', 100)->nullable();
                $table->string('notes', 500)->nullable();
                $table->timestamp('requested_at')->useCurrent();
                $table->dateTime('processed_at')->nullable();
                $table->unsignedBigInteger('processed_by')->nullable();
            });
        }

        if (! Schema::hasTable('dynamic_pages')) {
            Schema::create('dynamic_pages', function (Blueprint $table) {
                $table->id();
                $table->string('slug', 80)->unique();
                $table->string('title', 200);
                $table->mediumText('content_html');
                $table->string('meta_title', 200)->nullable();
                $table->string('meta_description', 500)->nullable();
                $table->boolean('is_published')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->string('setting_key', 80)->primary();
                $table->text('setting_value');
                $table->enum('value_type', ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])->default('STRING');
                $table->string('setting_group', 50)->default('GENERAL');
                $table->string('description', 255)->nullable();
                $table->timestamp('updated_at')->useCurrent();
            });
        }

        if (! Schema::hasTable('ride_events')) {
            Schema::create('ride_events', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ride_id');
                $table->unsignedBigInteger('driver_id')->nullable();
                $table->string('event_type', 50);
                $table->decimal('lat', 10, 7)->nullable();
                $table->decimal('lng', 10, 7)->nullable();
                $table->json('payload_json')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->index(['ride_id', 'created_at'], 'idx_ride_time');
            });
        }

        if (! Schema::hasTable('sos_alerts')) {
            Schema::create('sos_alerts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('ride_id');
                $table->unsignedBigInteger('user_id');
                $table->decimal('lat', 10, 7)->nullable();
                $table->decimal('lng', 10, 7)->nullable();
                $table->enum('status', ['ACTIVE', 'RESOLVED', 'FALSE_ALARM'])->default('ACTIVE');
                $table->unsignedBigInteger('resolved_by')->nullable();
                $table->dateTime('resolved_at')->nullable();
                $table->string('notes', 500)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (! Schema::hasTable('admin_users')) {
            Schema::create('admin_users', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->unique();
                $table->string('role_name', 50)->default('ADMIN');
                $table->json('permissions')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('created_at')->useCurrent();
            });
        }

        $this->seed();
    }

    private function seed(): void
    {
        $vehicles = [
            ['BIKE', 'Bike', 'Two-wheeler ride for solo travellers', 1, 25, 6, 1, 25, 5, 12, 1],
            ['AUTO', 'Auto', 'Auto-rickshaw for short distances', 3, 30, 9, 1.5, 30, 10, 15, 2],
            ['CAB', 'Cab', 'Sedan / hatchback for 4 passengers', 4, 50, 12, 2, 50, 15, 18, 3],
            ['CAB_XL', 'Cab XL', 'SUV / Innova for groups & luggage', 6, 80, 16, 2.5, 80, 20, 20, 4],
        ];
        foreach ($vehicles as $v) {
            DB::table('vehicle_types')->insertOrIgnore([
                'code' => $v[0], 'name' => $v[1], 'description' => $v[2], 'capacity' => $v[3],
                'base_fare' => $v[4], 'per_km_fare' => $v[5], 'per_min_fare' => $v[6], 'minimum_fare' => $v[7],
                'cancellation_fee' => $v[8], 'commission_percent' => $v[9], 'sort_order' => $v[10],
            ]);
        }

        $cities = [
            ['Bengaluru', 'Karnataka', 12.9715990, 77.5945630, 30],
            ['Delhi', 'Delhi', 28.7040600, 77.1024930, 35],
            ['Mumbai', 'Maharashtra', 19.0759840, 72.8776560, 30],
            ['Hyderabad', 'Telangana', 17.3850440, 78.4866710, 30],
            ['Chennai', 'Tamil Nadu', 13.0826800, 80.2707180, 25],
            ['Pune', 'Maharashtra', 18.5204300, 73.8567440, 25],
            ['Kolkata', 'West Bengal', 22.5726460, 88.3638950, 25],
        ];
        foreach ($cities as $c) {
            DB::table('cities')->insertOrIgnore([
                'name' => $c[0], 'state' => $c[1], 'center_lat' => $c[2], 'center_lng' => $c[3], 'radius_km' => $c[4],
            ]);
        }

        $settings = [
            ['app_name', 'Sawaari', 'STRING', 'GENERAL', 'Display name of the app'],
            ['support_email', 'support@sawaari.com', 'STRING', 'GENERAL', 'Customer support email'],
            ['support_phone', '+91-8888888888', 'STRING', 'GENERAL', 'Customer support phone'],
            ['currency_code', 'INR', 'STRING', 'GENERAL', 'Default currency'],
            ['currency_symbol', '₹', 'STRING', 'GENERAL', 'Default currency symbol'],
            ['country_code', 'IN', 'STRING', 'GENERAL', 'Default country'],
            ['country_dial_code', '+91', 'STRING', 'GENERAL', 'Default dial code'],
            ['driver_search_radius_km', '5', 'NUMBER', 'RIDE', 'Radius for finding nearby drivers'],
            ['ride_request_timeout_sec', '30', 'NUMBER', 'RIDE', 'Seconds a driver has to accept a ride request'],
            ['max_concurrent_requests', '5', 'NUMBER', 'RIDE', 'Max drivers to ping simultaneously'],
            ['cancellation_free_minutes', '3', 'NUMBER', 'RIDE', 'Free cancellation window after driver accepts'],
            ['default_commission_percent', '15', 'NUMBER', 'PAYMENT', 'Fallback commission if vehicle_type missing'],
            ['razorpay_enabled', 'false', 'BOOLEAN', 'PAYMENT', 'Toggle Razorpay integration'],
            ['cash_enabled', 'true', 'BOOLEAN', 'PAYMENT', 'Toggle cash payments'],
            ['wallet_enabled', 'true', 'BOOLEAN', 'PAYMENT', 'Toggle wallet payments'],
            ['min_payout_amount', '250', 'NUMBER', 'PAYOUT', 'Minimum driver payout request'],
            ['sos_email', 'safety@sawaari.com', 'STRING', 'SAFETY', 'Email to notify on SOS'],
            ['maintenance_mode', 'false', 'BOOLEAN', 'GENERAL', 'Block all non-admin traffic when true'],
        ];
        foreach ($settings as $s) {
            DB::table('settings')->insertOrIgnore([
                'setting_key' => $s[0], 'setting_value' => $s[1], 'value_type' => $s[2], 'setting_group' => $s[3], 'description' => $s[4],
            ]);
        }

        $pages = [
            ['privacy-policy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>Coming soon — update from admin panel.</p>'],
            ['terms-conditions', 'Terms & Conditions', '<h2>Terms &amp; Conditions</h2><p>Coming soon — update from admin panel.</p>'],
            ['about-us', 'About Us', '<h2>About Sawaari</h2><p>Sawaari is a bike, auto and cab booking platform.</p>'],
            ['contact-us', 'Contact Us', '<h2>Contact Us</h2><p>Email: support@sawaari.com</p>'],
            ['safety', 'Safety', '<h2>Your Safety, Our Priority</h2><p>Every ride is tracked, drivers are KYC-verified, and SOS support is one tap away.</p>'],
            ['faq', 'FAQs', '<h2>Frequently Asked Questions</h2><p>Add FAQs from the admin panel.</p>'],
            ['refund-policy', 'Refund Policy', '<h2>Refund Policy</h2><p>Refunds are processed within 5–7 business days.</p>'],
        ];
        foreach ($pages as $p) {
            DB::table('dynamic_pages')->insertOrIgnore([
                'slug' => $p[0], 'title' => $p[1], 'content_html' => $p[2],
            ]);
        }
    }

    public function down(): void
    {
        foreach ([
            'admin_users', 'sos_alerts', 'ride_events', 'settings', 'dynamic_pages', 'payouts',
            'payments', 'wallet_transactions', 'notifications', 'complaints', 'ratings',
            'coupon_redemptions', 'coupons', 'cities', 'vehicle_types',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
