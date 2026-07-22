<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ImageKitAuthController extends Controller
{
    public function auth(): JsonResponse
    {
        $token = (string) Str::uuid();
        $expire = time() + 2400;

        return response()->json([
            'status' => 'success',
            'message' => 'ImageKit authentication generated.',
            'data' => [
                'token' => $token,
                'expire' => $expire,
                'signature' => hash_hmac('sha1', $token.$expire, (string) config('services.imagekit.private_key')),
            ],
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
