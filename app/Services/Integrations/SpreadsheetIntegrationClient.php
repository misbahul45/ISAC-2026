<?php

namespace App\Services\Integrations;

use Illuminate\Support\Facades\Http;
use LogicException;

class SpreadsheetIntegrationClient
{
    /**
     * @param array<string, mixed> $event
     * @return array<string, mixed>
     */
    public function batchUpsert(array $event): array
    {
        if (! config('services.google_sheet.enabled')) {
            return ['skipped' => true];
        }

        $key = trim((string) config('services.google_sheet.key'));

        if (trim((string) config('services.google_sheet.url')) === '' || $key === '') {
            throw new LogicException('Google Spreadsheet API belum dikonfigurasi.');
        }

        $response = $this->request()
            ->post($this->endpoint('/events/batch-upsert'), [
                'apiKey' => $key,
                'operationId' => $event['operationId'] ?? null,
                'events' => [$event],
            ]);
        $response->throw();

        $data = $response->json();

        if (! is_array($data) || ($data['success'] ?? false) !== true) {
            throw new LogicException('Google Spreadsheet API mengembalikan response yang tidak valid.');
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    public function updateDeliveryStatus(
        string $eventId,
        string $status,
        ?string $providerMessageId = null,
        ?string $sentAt = null,
        ?int $retryCount = null,
        ?string $lastError = null,
    ): array {
        if (! config('services.google_sheet.enabled')) {
            return ['skipped' => true];
        }

        $key = trim((string) config('services.google_sheet.key'));

        if ($key === '') {
            throw new LogicException('Google Spreadsheet API belum dikonfigurasi.');
        }

        $payload = array_filter([
            'apiKey' => $key,
            'status' => $status,
            'providerMessageId' => $providerMessageId,
            'sentAt' => $sentAt,
            'retryCount' => $retryCount,
            'lastError' => $lastError,
        ], static fn (mixed $value): bool => $value !== null);

        $response = $this->request()
            ->post($this->endpoint('/events/'.rawurlencode($eventId).'/delivery-status'), $payload);
        $response->throw();

        $data = $response->json();

        if (! is_array($data) || ($data['success'] ?? false) !== true) {
            throw new LogicException('Google Spreadsheet API mengembalikan response status delivery yang tidak valid.');
        }

        return $data;
    }

    private function endpoint(string $path): string
    {
        return rtrim((string) config('services.google_sheet.url'), '/').'?path='.rawurlencode(ltrim($path, '/'));
    }

    private function request(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::acceptJson()
            ->asJson()
            ->withUserAgent('Mozilla/5.0 (compatible; ISAC-2026 Spreadsheet Integration/1.0)')
            ->timeout((int) config('services.google_sheet.timeout', 15))
            ->retry((int) config('services.google_sheet.retries', 3), 250, throw: false);
    }
}
