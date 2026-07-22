<?php

use App\Exceptions\EmailDeliveryException;
use App\Mail\VerifyEmailMail;
use App\Services\Mail\BrevoTransactionalMailClient;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

beforeEach(function (): void {
    config([
        'services.brevo.key' => 'test-api-key',
        'services.brevo.sender_email' => 'sender@example.com',
        'services.brevo.sender_name' => 'ISAC 2026',
        'services.brevo.endpoint' => 'https://api.brevo.com/v3',
        'services.brevo.timeout' => 10,
        'services.brevo.retries' => 0,
        'services.brevo.sandbox' => false,
    ]);
});

test('brevo client sends the expected transactional email payload', function (): void {
    Http::fake([
        'https://api.brevo.com/v3/smtp/email' => Http::response(['messageId' => 'test-message-id'], 201),
    ]);

    app(BrevoTransactionalMailClient::class)->send(
        'recipient@example.com',
        new VerifyEmailMail('123456'),
    );

    Http::assertSent(function (Request $request): bool {
        $payload = $request->data();

        return $request->url() === 'https://api.brevo.com/v3/smtp/email'
            && $request->method() === 'POST'
            && $request->hasHeader('api-key', 'test-api-key')
            && $payload['sender'] === [
                'name' => 'ISAC 2026',
                'email' => 'sender@example.com',
            ]
            && $payload['to'] === [['email' => 'recipient@example.com']]
            && $payload['subject'] === 'Kode Verifikasi Email ISAC 2026'
            && str_contains($payload['htmlContent'], '123456');
    });
});

test('brevo client supports provider sandbox mode', function (): void {
    config(['services.brevo.sandbox' => true]);
    Http::fake([
        'https://api.brevo.com/v3/smtp/email' => Http::response(['messageId' => 'sandbox-message-id'], 201),
    ]);

    app(BrevoTransactionalMailClient::class)->send(
        'recipient@example.com',
        new VerifyEmailMail('654321'),
    );

    Http::assertSent(
        fn (Request $request): bool => $request->data()['headers'] === ['X-Sib-Sandbox' => 'drop'],
    );
});

test('brevo client fails safely when api key is missing', function (): void {
    config(['services.brevo.key' => '']);
    Http::fake();

    expect(fn () => app(BrevoTransactionalMailClient::class)->send(
        'recipient@example.com',
        new VerifyEmailMail('123456'),
    ))->toThrow(LogicException::class, 'Brevo API key is not configured.');

    Http::assertNothingSent();
});

test('brevo client hides provider failures behind a safe application exception', function (): void {
    Http::fake([
        'https://api.brevo.com/v3/smtp/email' => Http::response([
            'message' => 'Provider credential or network details.',
        ], 401),
    ]);

    expect(fn () => app(BrevoTransactionalMailClient::class)->send(
        'recipient@example.com',
        new VerifyEmailMail('123456'),
    ))->toThrow(EmailDeliveryException::class, 'Layanan email sedang tidak tersedia. Silakan coba lagi.');
});

test('email delivery failures use a stable api response', function (): void {
    Route::get('/api/_test/email-delivery-error', fn () => throw new EmailDeliveryException);

    $this->getJson('/api/_test/email-delivery-error')
        ->assertStatus(503)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('message', 'Layanan email sedang tidak tersedia. Silakan coba lagi.')
        ->assertJsonPath('error.code', 'EMAIL_DELIVERY_FAILED');
});
