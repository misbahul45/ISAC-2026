<?php

namespace App\Models;

enum PaymentMethod: string
{
    case BANK_TRANSFER = 'BANK_TRANSFER';
    case QRIS = 'QRIS';
}
