<?php

namespace App\Exceptions;

use Exception;

class InvalidCredentialException extends Exception
{
    public $status = 401;
}
