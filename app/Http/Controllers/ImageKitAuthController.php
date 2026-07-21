<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;

class ImageKitAuthController extends Controller
{
    public function auth()
    {
        $privateKey = config('services.imagekit.private_key');

        $token = (string) Str::uuid(); // harus unik per request
        $expire = time() + 2400; // detik, wajib < 1 jam dari sekarang

        $signature = hash_hmac('sha1', $token.$expire, $privateKey);

        return response()->json([
            'token' => $token,
            'expire' => $expire,
            'signature' => $signature,
        ]);
    }
}
