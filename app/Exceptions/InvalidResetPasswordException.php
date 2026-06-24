<?php

namespace App\Exceptions;

use Exception;

class InvalidResetPasswordException extends Exception
{
    public $status = 422;
}
