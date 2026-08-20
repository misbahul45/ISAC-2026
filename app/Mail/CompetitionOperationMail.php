<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompetitionOperationMail extends Mailable
{
    use Queueable, SerializesModels;

    /** @param array<string, mixed> $payload */
    public function __construct(public readonly array $payload) {}

    public function envelope(): Envelope
    {
        $title = data_get($this->payload, 'announcement.title')
            ?: 'Pembaruan Kompetisi ISAC 2026';

        return new Envelope(subject: "[ISAC 2026] {$title}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.competition-operation');
    }
}
