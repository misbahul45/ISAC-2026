<?php

namespace App\Repositories\Contracts;

use App\Models\File;

interface FileRepositoryInterface
{
    /**
     * @param  array{file_id: string, url: string, uploaded_by?: string|null}  $data
     */
    public function create(array $data): File;
}
