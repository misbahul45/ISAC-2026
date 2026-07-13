<?php

namespace App\Repositories\Contracts;

use App\Models\File;

interface FileRepositoryInterface
{
    /**
     * @param array{original_name: string, stored_name: string, path: string, disk: string, mime_type: string, size: int, collection?: string|null} $data
     */
    public function create(array $data): File;
}
