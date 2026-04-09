<?php

namespace Database\Seeders;

use App\Models\Arrondissement;
// use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class ArrondissementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Arrondissement::truncate();

        $csv_file = \fopen(\base_path('database/seeders/csv/arrondissements.csv'), 'r');

        while (false !== ($data = \fgetcsv($csv_file, 2000, ","))) {
            Arrondissement::create([
                // "wording"               => Str::ucfirst(Str::lower($data['0'])),
                "wording"           => \trim($data['0']),
                "departement_id"    => \trim($data['1'])
            ]);
        }
        \fclose($csv_file);
    }
}
