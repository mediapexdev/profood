<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Category::truncate();

        $csv_file = \fopen(\base_path('database/seeders/csv/categories.csv'), 'r');

        while (false !== ($data = \fgetcsv($csv_file, null, ','))) {
            Category::create([
                'wording'       => Str::ucfirst(Str::lower(\trim($data['0']))),
                'illustration'  => \trim($data['1'])
            ]);
        }
        \fclose($csv_file);
    }
}
