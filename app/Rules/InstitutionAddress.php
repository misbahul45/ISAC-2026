<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use JsonException;

class InstitutionAddress implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        try {
            $address = json_decode($value, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            $fail('Alamat institusi harus berupa JSON yang valid.');

            return;
        }

        if (! is_array($address)) {
            $fail('Alamat institusi harus memuat provinsi, kota, dan alamat lengkap.');

            return;
        }

        foreach ([
            'province' => ['Provinsi', 100],
            'city' => ['Kota atau kabupaten', 100],
            'address' => ['Alamat lengkap', 1000],
        ] as $field => [$label, $maximum]) {
            $part = $address[$field] ?? null;
            if (! is_string($part) || trim($part) === '') {
                $fail("{$label} wajib diisi.");

                return;
            }

            if (mb_strlen(trim($part)) > $maximum) {
                $fail("{$label} maksimal {$maximum} karakter.");

                return;
            }
        }
    }
}
