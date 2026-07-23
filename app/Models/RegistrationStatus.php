<?php

namespace App\Models;

enum RegistrationStatus: string
{
    case WAITING_PAYMENT = 'WAITING_PAYMENT';
    case WAITING_VERIFICATION = 'WAITING_VERIFICATION';
    case VERIFIED = 'VERIFIED';
    case REJECTED = 'REJECTED';
    case REVISION_REQUIRED = 'REVISION_REQUIRED';
    case CANCELLED = 'CANCELLED';
}
