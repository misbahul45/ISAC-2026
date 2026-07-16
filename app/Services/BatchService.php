<?php

namespace App\Services;

use App\Repositories\Contracts\BatchRepositoryInterface;

class BatchService
{
    protected $batchRepo;

    public function __construct(BatchRepositoryInterface $batchRepo)
    {
        $this->batchRepo = $batchRepo;
    }

    public function getAllBatches()
    {
        return $this->batchRepo->getAll();
    }

    public function getBatchById($id)
    {
        return $this->batchRepo->findById($id);
    }

    public function createBatch(array $data)
    {
        return $this->batchRepo->create($data);
    }

    public function updateBatch($id, array $data)
    {
        return $this->batchRepo->update($id, $data);
    }

    public function deleteBatch($id)
    {
        return $this->batchRepo->delete($id);
    }
}