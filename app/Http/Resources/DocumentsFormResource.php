<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Team $resource */
class DocumentsFormResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'documentUrl' => $this->document_url,
            'twibbonUrl' => $this->twibbon_url,
            'revisionNote' => $this->revision_step === 'DOCUMENTS' ? $this->verification_note : null,
        ];
    }
}
