<?php

namespace Database\Seeders;

use App\Models\Localite;
// use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class LocaliteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Localite::truncate();

        $csv_file = \fopen(\base_path('database/seeders/csv/localites.csv'), 'r');

        while (false !== ($data = \fgetcsv($csv_file, 2000, ","))) {
            Localite::create([
                // "wording"               => Str::ucfirst(Str::lower($data['0'])),
                "wording"           => \trim($data['0']),
                "commune_id"        => \trim($data['1']),
                "arrondissement_id" => \trim($data['2']),
                "departement_id"    => \trim($data['3']),
            ]);
        }
        \fclose($csv_file);
    }
}
