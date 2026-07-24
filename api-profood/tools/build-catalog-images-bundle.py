#!/usr/bin/env python3
"""
Construit le bundle d'illustrations du catalogue à partir des assets de
profood-app-v2 (mêmes IDs que l'API — vérifié : IDs API === IDs v2).

Produit un dossier + zip prêt à téléverser sur le serveur :

    catalog-images-bundle/
      manifest.json                  {"slices": {"12": "slices/bavette.png"}, …}
      slices/*.png                   (256×256, fond transparent, tels quels)
      box_types/*.jpg
      categories/*.jpg
    catalog-images-bundle.zip

Puis, sur le serveur (après unzip) :

    php artisan catalog-images:import /chemin/vers/catalog-images-bundle --dry-run
    php artisan catalog-images:import /chemin/vers/catalog-images-bundle
    php artisan storage:link   # si pas déjà fait (la route api/image/ lit le disque public)

Usage local :  python3 tools/build-catalog-images-bundle.py [dossier-sortie]
(se lance depuis api-profood/ ; suppose ../profood-app-v2 présent, cas du monorepo)
"""
import json
import pathlib
import shutil
import sys
import zipfile

API_DIR = pathlib.Path(__file__).resolve().parent.parent
V2_DIR = API_DIR.parent / "profood-app-v2"
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else API_DIR / "catalog-images-bundle"

# (clé manifest / fichier data v2 / sous-dossier des images v2)
SOURCES = [
    ("slices", "slices.json"),
    ("box_types", "boxes.json"),
    ("categories", "categories.json"),
]


def main() -> None:
    if not V2_DIR.is_dir():
        sys.exit(f"profood-app-v2 introuvable à côté de l'API ({V2_DIR})")

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    manifest: dict[str, dict[str, str]] = {}
    copied = 0

    for key, data_file in SOURCES:
        rows = json.loads((V2_DIR / "src" / "data" / data_file).read_text())
        manifest[key] = {}
        (OUT / key).mkdir()
        for row in rows:
            image = row.get("image") or ""
            src = V2_DIR / "public" / image.lstrip("/")
            if not src.is_file():
                print(f"  ⚠ {key}#{row['id']} : image absente ({image}) — ignorée")
                continue
            dest_rel = f"{key}/{src.name}"
            shutil.copy2(src, OUT / dest_rel)
            manifest[key][str(row["id"])] = dest_rel
            copied += 1

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False))

    zip_path = OUT.with_suffix(".zip")
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(OUT.rglob("*")):
            zf.write(f, f.relative_to(OUT.parent))

    total = sum(len(v) for v in manifest.values())
    size_mb = zip_path.stat().st_size / 1e6
    print(f"✓ {copied} fichier(s) copiés, {total} entrées manifest → {zip_path} ({size_mb:.1f} Mo)")


if __name__ == "__main__":
    main()
