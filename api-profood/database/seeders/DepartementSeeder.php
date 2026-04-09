<?php

namespace Database\Seeders;

use App\Models\Departement;
// use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class DepartementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Departement::truncate();

        $csv_file = \fopen(\base_path('database/seeders/csv/departements.csv'), 'r');

        while (false !== ($data = \fgetcsv($csv_file, 2000, ","))) {
            Departement::create([
                // "wording" => Str::ucfirst(Str::lower($data['0']))
                "wording" => \trim($data['0'])
            ]);
        }
        \fclose($csv_file);
    }
}
