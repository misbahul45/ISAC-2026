<?php

namespace App\Enums;

enum AuthChallengePurpose: string
{
    case VERIFY_EMAIL = 'VERIFY_EMAIL';
    case RESET_PASSWORD = 'RESET_PASSWORD';
}
