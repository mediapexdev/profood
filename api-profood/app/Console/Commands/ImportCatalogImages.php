<?php

namespace App\Console\Commands;

use App\Models\BoxType;
use App\Models\Category;
use App\Models\Slice;
use App\Services\ImageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Importe les illustrations du catalogue depuis un bundle (dossier ou zip
 * décompressé) produit par tools/build-catalog-images-bundle.py :
 *
 *   bundle/
 *     manifest.json   { "slices": {"12": "slices/bavette.png", …},
 *                       "box_types": {…}, "categories": {…} }
 *     slices/*.png  box_types/*.jpg  categories/*.jpg
 *
 * Chaque fichier est copié TEL QUEL (les PNG gardent leur transparence,
 * aucun recadrage) vers le disque public `illustrations/{type}/…` et la
 * colonne `illustration` du modèle passe sur l'URL de la route de service
 * (api/image/…) — exactement la convention d'ImageService::processToDisk.
 * L'ancien fichier disque est supprimé s'il vivait déjà sous illustrations/
 * (les vieilles valeurs base64 sont simplement remplacées).
 *
 * Usage :
 *   php artisan catalog-images:import /chemin/vers/bundle --dry-run
 *   php artisan catalog-images:import /chemin/vers/bundle
 */
class ImportCatalogImages extends Command
{
    protected $signature = 'catalog-images:import {path : Dossier du bundle (contenant manifest.json)}
                            {--dry-run : Affiche ce qui serait fait sans rien écrire}';

    protected $description = 'Importe les illustrations produits (slices, box types, catégories) depuis un bundle d\'images';

    private const TYPES = [
        'slices'     => Slice::class,
        'box_types'  => BoxType::class,
        'categories' => Category::class,
    ];

    public function handle(): int
    {
        $base = rtrim($this->argument('path'), '/');
        $manifestPath = $base.'/manifest.json';

        if (! is_file($manifestPath)) {
            $this->error("manifest.json introuvable dans {$base}");

            return self::FAILURE;
        }

        $manifest = json_decode((string) file_get_contents($manifestPath), true);
        if (! is_array($manifest)) {
            $this->error('manifest.json illisible.');

            return self::FAILURE;
        }

        $dry = (bool) $this->option('dry-run');
        $done = $missing = $absent = 0;

        foreach (self::TYPES as $type => $modelClass) {
            foreach (($manifest[$type] ?? []) as $id => $relativeFile) {
                $source = $base.'/'.ltrim($relativeFile, '/');
                $label = "{$type}#{$id}";

                if (! is_file($source)) {
                    $this->warn("  {$label} : fichier absent du bundle ({$relativeFile})");
                    $absent++;
                    continue;
                }

                $model = $modelClass::find((int) $id);
                if (! $model) {
                    $this->warn("  {$label} : id inconnu en base — ignoré");
                    $missing++;
                    continue;
                }

                $ext = strtolower(pathinfo($source, PATHINFO_EXTENSION)) ?: 'png';
                $slug = Str::slug(pathinfo($source, PATHINFO_FILENAME));
                $relative = ImageService::ILLUSTRATIONS_DIR."/{$type}/{$slug}-".Str::uuid()->toString().".{$ext}";

                if ($dry) {
                    $this->line("  {$label} : {$relativeFile} → {$relative}");
                    $done++;
                    continue;
                }

                Storage::disk('public')->put($relative, (string) file_get_contents($source));

                // Nettoie l'ancien fichier disque (jamais les data-URI base64).
                $previous = (string) $model->illustration;
                if (Str::contains($previous, 'api/image/'.ImageService::ILLUSTRATIONS_DIR.'/')) {
                    $old = Str::after($previous, 'api/image/');
                    Storage::disk('public')->delete($old);
                }

                $model->illustration = url('api/image/'.$relative);
                $model->save();
                $done++;
            }
        }

        $mode = $dry ? '[dry-run] ' : '';
        $this->info("{$mode}{$done} illustration(s) traitée(s), {$missing} id(s) inconnu(s), {$absent} fichier(s) absent(s).");

        return self::SUCCESS;
    }
}
