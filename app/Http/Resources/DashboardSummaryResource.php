<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardSummaryResource extends JsonResource
{
    /**
     * @return array<string, int>
     */
    public function toArray(Request $request): array
    {
        return [
            'total' => $this->resource['total'],
            'active' => $this->resource['active'],
            'completed' => $this->resource['completed'],
        ];
    }
}
