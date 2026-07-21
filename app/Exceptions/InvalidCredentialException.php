<?php

namespace App\Exceptions;

use Exception;

class InvalidCredentialException extends Exception
{
    public function __construct(
        string $message,
        public int $status = 401,
    ) {
        parent::__construct($message);
    }
}
