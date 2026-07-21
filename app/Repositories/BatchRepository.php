<?php

namespace App\Repositories;

use App\Models\Batch;
use App\Repositories\Contracts\BatchRepositoryInterface;

class BatchRepository implements BatchRepositoryInterface
{
    public function getAll()
    {
        // Bisa disesuaikan jadi return Batch::paginate(10); jika datanya banyak
        return Batch::all(); 
    }

    public function findById($id)
    {
        return Batch::findOrFail($id);
    }

    public function create(array $data)
    {
        return Batch::create($data);
    }

    public function update($id, array $data)
    {
        $batch = Batch::findOrFail($id);
        $batch->update($data);
        
        return $batch;
    }

    public function delete($id)
    {
        $batch = Batch::findOrFail($id);
        
        return $batch->delete();
    }
}