<?php

namespace App\Services\Mail;

use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use LogicException;

class TransactionalMailService
{
    public function __construct(
        private readonly BrevoTransactionalMailClient $brevo,
    ) {}

    public function sendVerificationCode(string $recipientEmail, string $code): void
    {
        $this->deliver($recipientEmail, new VerifyEmailMail($code));
    }

    public function sendResetPasswordCode(string $recipientEmail, string $code): void
    {
        $this->deliver($recipientEmail, new ResetPasswordMail($code));
    }

    private function deliver(string $recipientEmail, Mailable $mailable): void
    {
        $transport = (string) config('mail.transactional_transport', 'smtp');

        if (app()->environment('testing') || $transport === 'smtp') {
            Mail::to($recipientEmail)->send($mailable);

            return;
        }

        if ($transport !== 'brevo') {
            throw new LogicException('Unsupported transactional mail transport.');
        }

        $this->brevo->send($recipientEmail, $mailable);
    }
}
