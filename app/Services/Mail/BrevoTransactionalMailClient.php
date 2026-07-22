<?php

namespace App\Services\Mail;

use App\Exceptions\EmailDeliveryException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Http;
use LogicException;

class BrevoTransactionalMailClient
{
    public function send(string $recipientEmail, Mailable $mailable): void
    {
        $apiKey = trim((string) config('services.brevo.key'));
        $senderEmail = trim((string) config('services.brevo.sender_email'));
        $senderName = trim((string) config('services.brevo.sender_name', config('app.name')));
        $endpoint = rtrim((string) config('services.brevo.endpoint', 'https://api.brevo.com/v3'), '/');

        if ($apiKey === '') {
            throw new LogicException('Brevo API key is not configured.');
        }

        if (! filter_var($senderEmail, FILTER_VALIDATE_EMAIL)) {
            throw new LogicException('Brevo sender email is not configured correctly.');
        }

        $payload = [
            'sender' => [
                'name' => $senderName !== '' ? $senderName : (string) config('app.name'),
                'email' => $senderEmail,
            ],
            'to' => [['email' => $recipientEmail]],
            'subject' => (string) $mailable->envelope()->subject,
            'htmlContent' => $mailable->render(),
        ];

        if ((bool) config('services.brevo.sandbox', false)) {
            $payload['headers'] = ['X-Sib-Sandbox' => 'drop'];
        }

        try {
            Http::baseUrl($endpoint)
                ->acceptJson()
                ->asJson()
                ->withHeaders(['api-key' => $apiKey])
                ->timeout((int) config('services.brevo.timeout', 10))
                ->retry((int) config('services.brevo.retries', 2), 250)
                ->post('/smtp/email', $payload)
                ->throw();
        } catch (ConnectionException|RequestException $exception) {
            throw new EmailDeliveryException(previous: $exception);
        }
    }
}
