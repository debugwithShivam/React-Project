<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Allow only the given roles (comma-separated), e.g. role:DRIVER,ADMIN.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $roles = array_map('strtoupper', $roles);
        abort_unless($request->user() && in_array(strtoupper((string) $request->user()->role), $roles, true), 403, 'Access denied for this role.');

        return $next($request);
    }
}
