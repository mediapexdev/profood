<?php

namespace Database\Seeders;

use App\Models\Slice;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SliceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Slice::truncate();

        $csv_file = \fopen(\base_path('database/seeders/csv/slices.csv'), 'r');

        while (false !== ($data = \fgetcsv($csv_file, 2000, ','))) {
            Slice::create([
                'wording'           => Str::ucfirst(Str::lower(\trim($data['0']))),
                'category_id'       => \trim($data['1']),
                'price'             => \trim($data['2']),
                'weight'            => \trim($data['3']),
                'available_in_box'  => \trim($data['4']),
                'illustration'      => \trim($data['5']),
            ]);
        }
        \fclose($csv_file);
    }
}
