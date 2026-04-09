<?php

namespace Database\Seeders;

use App\Models\Commune;
// use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class CommuneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Commune::truncate();

        $csv_file = \fopen(\base_path('database/seeders/csv/communes.csv'), 'r');

        while (false !== ($data = \fgetcsv($csv_file, 2000, ","))) {
            Commune::create([
                // "wording"               => Str::ucfirst(Str::lower($data['0'])),
                "wording"           => \trim($data['0']),
                "arrondissement_id" => \trim($data['1']),
                "departement_id"    => \trim($data['2']),
            ]);
        }
        \fclose($csv_file);
    }
}
