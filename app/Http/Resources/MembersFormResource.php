<?php

namespace App\Http\Resources;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Member $resource */
class MembersFormResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role,
            'email' => $this->email,
            'phone' => $this->phone,
            'major' => $this->major,
            'faculty' => $this->faculty,
            'studentId' => $this->student_id,
            'birthDate' => $this->birth_date?->toISOString(),
            'educationLevel' => $this->education_level,
            'photoFileId' => $this->photo_file_id,
            'sortOrder' => $this->sort_order,
        ];
    }
}
