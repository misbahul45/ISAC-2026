<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class EmailDeliveryException extends Exception
{
    public function __construct(
        string $message = 'Layanan email sedang tidak tersedia. Silakan coba lagi.',
        public int $status = 503,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
