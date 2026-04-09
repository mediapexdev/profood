<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\BoxType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BoxTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        BoxType::truncate();
  
        $csv_file = \fopen(\base_path('database/seeders/csv/box-types.csv'), 'r');

        while (false !== ($data = \fgetcsv($csv_file, null, ','))) {
            BoxType::create([
                'wording'       => Str::ucfirst(Str::lower(\trim($data['0']))),
                'capacity'      => \trim($data['1']),
                'price'         => \trim($data['2']),
                'illustration'  => \trim($data['3'])
            ]);
        }
        \fclose($csv_file);
    }
}
