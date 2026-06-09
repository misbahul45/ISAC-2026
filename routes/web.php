<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Todos/Index', [
        'title' => 'Todo List',
    ]);
})->name('todos.index');
