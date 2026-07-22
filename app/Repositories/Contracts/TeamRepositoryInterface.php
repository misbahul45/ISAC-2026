<?php

namespace App\Repositories\Contracts;

use App\Models\Team;

interface TeamRepositoryInterface
{
    /**
     * @param  array{name?: string, phone?: string|null, institution_name?: string|null, institution_address?: string|null, document_url?: string|null, twibbon_url?: string|null}  $data
     */
    public function update(Team $team, array $data): Team;
}
