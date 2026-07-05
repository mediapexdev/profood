<?php

namespace App\Console\Commands;

use App\Models\BoxType;
use App\Models\Category;
use App\Models\Slice;
use App\Services\ImageService;
use Illuminate\Console\Command;

/**
 * One-off migration of legacy base64 illustrations (stored inline in the DB)
 * to files on the public disk, served by the image route.
 *
 * Idempotent: only rows whose illustration is still a data URI are touched, so
 * it can be re-run safely. Run with --dry-run first to see the counts. This is
 * NOT run automatically — a human runs it once after deploying, having checked
 * the public disk is writable.
 */
class BackfillIllustrations extends Command
{
    protected $signature = 'images:backfill {--dry-run : Report what would change without writing anything}';

    protected $description = 'Convert base64 illustrations in the DB to files on the public disk';

    public function handle(ImageService $imageService): int
    {
        $map = [
            [Slice::class, 'slices'],
            [BoxType::class, 'box_types'],
            [Category::class, 'categories'],
        ];

        $dryRun = (bool) $this->option('dry-run');
        $converted = 0;

        foreach ($map as [$model, $subdir]) {
            $base = fn () => $model::whereNotNull('illustration')->where('illustration', 'like', 'data:image%');
            $count = $base()->count();
            $this->info(sprintf('%s: %d base64 illustration(s)', class_basename($model), $count));

            if ($dryRun) {
                continue;
            }

            $base()->chunkById(50, function ($rows) use ($imageService, $subdir, &$converted) {
                foreach ($rows as $row) {
                    $commaPos = strpos((string) $row->illustration, ',');
                    if ($commaPos === false) {
                        continue;
                    }
                    $binary = base64_decode(substr($row->illustration, $commaPos + 1), true);
                    if ($binary === false) {
                        $this->warn("  skipped #{$row->id} (invalid base64)");
                        continue;
                    }
                    $row->illustration = $imageService->storeBinary($binary, $subdir);
                    $row->save();
                    $converted++;
                }
            });
        }

        $this->info(($dryRun ? '[dry-run] ' : '') . "Done — {$converted} illustration(s) " . ($dryRun ? 'to convert.' : 'converted.'));

        return self::SUCCESS;
    }
}
