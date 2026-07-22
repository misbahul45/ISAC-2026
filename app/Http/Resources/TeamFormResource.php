<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Team $resource */
class TeamFormResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing('registration.competition');

        return [
            'id' => $this->id,
            'code' => $this->code,
            'email' => $this->email,
            'name' => $this->name,
            'phone' => $this->phone,
            'institutionName' => $this->institution_name,
            'institutionAddress' => $this->institution_address,
            'documentUrl' => $this->document_url,
            'twibbonUrl' => $this->twibbon_url,
            'status' => $this->status,
            'verificationNote' => $this->verification_note,
            'revisionStep' => $this->revision_step,
            'competitionSummary' => $this->registration?->competition === null ? null : [
                'id' => $this->registration->competition->id,
                'name' => $this->registration->competition->name,
                'type' => $this->registration->competition->type,
            ],
        ];
    }
}
