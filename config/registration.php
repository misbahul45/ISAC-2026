<?php

return [
    'payment_methods' => ['BANK_TRANSFER', 'QRIS'],
    'payment_instructions' => env('REGISTRATION_PAYMENT_INSTRUCTIONS', 'Ikuti instruksi pembayaran resmi panitia ISAC.'),
    'qr_image_url' => env('REGISTRATION_QR_IMAGE_URL', '/qris.png'),
    'promo' => [
        'code' => env('REGISTRATION_PROMO_CODE', 'ISAXOP'),
        'discount_percent' => (int) env('REGISTRATION_PROMO_DISCOUNT_PERCENT', 15),
    ],
];
