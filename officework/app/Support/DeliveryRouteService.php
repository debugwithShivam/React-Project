<?php

declare(strict_types=1);

namespace App\Support;

final class DeliveryRouteService
{
    private const CACHE_SECONDS = 25;
    private const REROUTE_DISTANCE_KM = 0.05;

    public static function tracking(array $order, array $location): array
    {
        $destination = self::destination($order);
        $driver = [
            'latitude' => (float) $location['latitude'],
            'longitude' => (float) $location['longitude'],
            'heading' => (float) ($location['heading'] ?? 0),
            'speed_mps' => max(0.0, (float) ($location['speed_mps'] ?? 0)),
            'accuracy_meters' => max(0.0, (float) ($location['accuracy_meters'] ?? 0)),
            'recorded_at' => (string) ($location['recorded_at'] ?? ''),
        ];
        if ($destination === null) {
            return [
                'active' => true,
                'status' => (string) $order['order_status'],
                'driver' => $driver,
                'customer' => null,
                'route' => null,
                'message' => 'Delivery destination is being resolved.',
            ];
        }

        $route = self::cachedRoute((int) $order['id'], $driver, $destination);
        return [
            'active' => true,
            'status' => (string) $order['order_status'],
            'driver' => $driver,
            'customer' => $destination + ['address' => (string) ($order['address'] ?? '')],
            'route' => $route,
        ];
    }

    private static function destination(array $order): ?array
    {
        $latitude = (float) ($order['delivery_latitude'] ?? 0);
        $longitude = (float) ($order['delivery_longitude'] ?? 0);
        if (self::validCoordinate($latitude, $longitude)) {
            return ['latitude' => $latitude, 'longitude' => $longitude];
        }
        try {
            $coordinates = GoogleGeocodingService::coordinates((string) ($order['address'] ?? ''));
        } catch (\Throwable) {
            return null;
        }
        if ($coordinates === null) {
            return null;
        }
        Database::connection()->prepare(
            'update orders set delivery_latitude=:latitude,delivery_longitude=:longitude,updated_at=CURRENT_TIMESTAMP where id=:id'
        )->execute([
            'latitude' => $coordinates['latitude'],
            'longitude' => $coordinates['longitude'],
            'id' => (int) $order['id'],
        ]);
        return $coordinates;
    }

    private static function cachedRoute(int $orderId, array $origin, array $destination): array
    {
        $db = Database::connection();
        $stmt = $db->prepare('select * from delivery_route_snapshots where order_id=:order limit 1');
        $stmt->execute(['order' => $orderId]);
        $cached = $stmt->fetch() ?: null;
        if ($cached !== null && self::cacheIsFresh($cached, $origin, $destination)) {
            return self::publicRoute($cached);
        }

        $route = self::googleRoute($origin, $destination) ?? self::fallbackRoute($origin, $destination);
        $params = [
            'order_id' => $orderId,
            'origin_latitude' => $origin['latitude'],
            'origin_longitude' => $origin['longitude'],
            'destination_latitude' => $destination['latitude'],
            'destination_longitude' => $destination['longitude'],
            'distance_meters' => $route['distance_meters'],
            'duration_seconds' => $route['duration_seconds'],
            'encoded_polyline' => $route['encoded_polyline'],
            'route_source' => $route['source'],
        ];
        $sql = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql'
            ? 'insert into delivery_route_snapshots (order_id,origin_latitude,origin_longitude,destination_latitude,destination_longitude,distance_meters,duration_seconds,encoded_polyline,route_source,refreshed_at) values (:order_id,:origin_latitude,:origin_longitude,:destination_latitude,:destination_longitude,:distance_meters,:duration_seconds,:encoded_polyline,:route_source,CURRENT_TIMESTAMP) on duplicate key update origin_latitude=values(origin_latitude),origin_longitude=values(origin_longitude),destination_latitude=values(destination_latitude),destination_longitude=values(destination_longitude),distance_meters=values(distance_meters),duration_seconds=values(duration_seconds),encoded_polyline=values(encoded_polyline),route_source=values(route_source),refreshed_at=CURRENT_TIMESTAMP'
            : 'insert into delivery_route_snapshots (order_id,origin_latitude,origin_longitude,destination_latitude,destination_longitude,distance_meters,duration_seconds,encoded_polyline,route_source,refreshed_at) values (:order_id,:origin_latitude,:origin_longitude,:destination_latitude,:destination_longitude,:distance_meters,:duration_seconds,:encoded_polyline,:route_source,CURRENT_TIMESTAMP) on conflict(order_id) do update set origin_latitude=excluded.origin_latitude,origin_longitude=excluded.origin_longitude,destination_latitude=excluded.destination_latitude,destination_longitude=excluded.destination_longitude,distance_meters=excluded.distance_meters,duration_seconds=excluded.duration_seconds,encoded_polyline=excluded.encoded_polyline,route_source=excluded.route_source,refreshed_at=CURRENT_TIMESTAMP';
        $db->prepare($sql)->execute($params);
        $route['updated_at'] = date(DATE_ATOM);
        $route['eta_at'] = date(DATE_ATOM, time() + (int) $route['duration_seconds']);
        return $route;
    }

    private static function cacheIsFresh(array $cached, array $origin, array $destination): bool
    {
        $refreshed = strtotime((string) ($cached['refreshed_at'] ?? '')) ?: 0;
        if (time() - $refreshed > self::CACHE_SECONDS) {
            return false;
        }
        if (self::distanceKm((float) $cached['origin_latitude'], (float) $cached['origin_longitude'], (float) $origin['latitude'], (float) $origin['longitude']) > self::REROUTE_DISTANCE_KM) {
            return false;
        }
        return self::distanceKm((float) $cached['destination_latitude'], (float) $cached['destination_longitude'], (float) $destination['latitude'], (float) $destination['longitude']) < 0.01;
    }

    private static function googleRoute(array $origin, array $destination): ?array
    {
        $key = trim(Settings::moduleGet('medical', 'google_maps_server_api_key', ''));
        if ($key === '') {
            $key = trim((string) Env::get('GOOGLE_MAPS_SERVER_API_KEY', ''));
        }
        if ($key === '' || !function_exists('curl_init')) {
            return null;
        }
        $payload = json_encode([
            'origin' => ['location' => ['latLng' => ['latitude' => $origin['latitude'], 'longitude' => $origin['longitude']]]],
            'destination' => ['location' => ['latLng' => ['latitude' => $destination['latitude'], 'longitude' => $destination['longitude']]]],
            'travelMode' => 'DRIVE',
            'routingPreference' => 'TRAFFIC_AWARE',
            'computeAlternativeRoutes' => false,
            'languageCode' => 'en-IN',
            'units' => 'METRIC',
        ], JSON_UNESCAPED_SLASHES);
        if (!is_string($payload)) {
            return null;
        }
        $curl = curl_init('https://routes.googleapis.com/directions/v2:computeRoutes');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'X-Goog-Api-Key: ' . $key,
                'X-Goog-FieldMask: routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
            ],
            CURLOPT_POSTFIELDS => $payload,
        ]);
        $raw = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        if (!is_string($raw) || $status < 200 || $status >= 300) {
            return null;
        }
        $decoded = json_decode($raw, true);
        $route = is_array($decoded) ? ($decoded['routes'][0] ?? null) : null;
        if (!is_array($route) || (int) ($route['distanceMeters'] ?? 0) <= 0) {
            return null;
        }
        $seconds = (int) round((float) rtrim((string) ($route['duration'] ?? '0s'), 's'));
        return [
            'distance_meters' => (int) $route['distanceMeters'],
            'duration_seconds' => max(1, $seconds),
            'encoded_polyline' => (string) ($route['polyline']['encodedPolyline'] ?? ''),
            'source' => 'google_routes',
        ];
    }

    private static function fallbackRoute(array $origin, array $destination): array
    {
        $distanceMeters = max(100, (int) round(self::distanceKm(
            (float) $origin['latitude'],
            (float) $origin['longitude'],
            (float) $destination['latitude'],
            (float) $destination['longitude']
        ) * 1250));
        return [
            'distance_meters' => $distanceMeters,
            'duration_seconds' => max(180, (int) ceil(($distanceMeters / 1000) / 25 * 3600)),
            'encoded_polyline' => '',
            'source' => 'geographic_fallback',
        ];
    }

    private static function publicRoute(array $route): array
    {
        $seconds = max(1, (int) ($route['duration_seconds'] ?? 0));
        return [
            'distance_meters' => max(0, (int) ($route['distance_meters'] ?? 0)),
            'duration_seconds' => $seconds,
            'encoded_polyline' => (string) ($route['encoded_polyline'] ?? ''),
            'source' => (string) ($route['route_source'] ?? 'geographic_fallback'),
            'updated_at' => (string) ($route['refreshed_at'] ?? ''),
            'eta_at' => date(DATE_ATOM, time() + $seconds),
        ];
    }

    private static function validCoordinate(float $latitude, float $longitude): bool
    {
        return $latitude >= -90 && $latitude <= 90 && $longitude >= -180 && $longitude <= 180
            && !($latitude === 0.0 && $longitude === 0.0);
    }

    private static function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earth = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $earth * 2 * atan2(sqrt($a), sqrt(max(0.0, 1 - $a)));
    }
}
