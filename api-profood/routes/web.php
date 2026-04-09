<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by bootstrap/app.php via withRouting() and assigned
| the "web" middleware group.
|
*/

Route::get('/', function () {
    return view('welcome');
});
