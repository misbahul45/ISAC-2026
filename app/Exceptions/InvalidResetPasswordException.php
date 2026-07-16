<?php

namespace App\Exceptions;

use Exception;

class InvalidResetPasswordException extends Exception
{
    public function __construct(
        string $message,
        public string $errorCode,
        public int $status = 422)
    {
        parent::__construct($message);
    }
}
