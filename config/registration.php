<?php

return [
    'payment_methods' => ['BANK_TRANSFER', 'QRIS'],
    'payment_instructions' => env('REGISTRATION_PAYMENT_INSTRUCTIONS', 'Ikuti instruksi pembayaran resmi panitia ISAC.'),
    'qr_image_url' => env('REGISTRATION_QR_IMAGE_URL', '/qris.png'),
];
