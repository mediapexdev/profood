"""Habille les captures brutes (store/ios/screenshots/raw-*.png, 1290×2796) avec une légende,
dans le style du kit v2 : fond sombre, accroche orange, titre blanc + mot orange, cadre arrondi."""
from PIL import Image, ImageDraw, ImageFont
import os

RAW = 'store/raw'
CAPTIONS = [
    ('raw-01-dashboard.png',    'dashboard',    'Votre journée', 'en un coup d’œil.'),
    ('raw-02-tournee.png',      'tournee',      'Vos arrêts', 'dans le bon ordre.'),
    ('raw-03-livraison.png',    'livraison',    'Itinéraire et client', 'en un geste.'),
    ('raw-04-confirmation.png', 'confirmation', 'Preuve de livraison', 'photo et note.'),
    ('raw-05-historique.png',   'historique',   'Vos livraisons', 'et vos encaissements.'),
]
BG = (34, 22, 16); ORANGE = (239, 84, 3); WHITE = (255, 255, 255)

def font(size, bold=True):
    for p in ['/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
              '/System/Library/Fonts/HelveticaNeue.ttc']:
        try: return ImageFont.truetype(p, size)
        except OSError: pass
    return ImageFont.load_default()

def rounded(im, radius):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], radius, fill=255)
    out = Image.new('RGBA', im.size); out.paste(im, (0, 0), mask); return out

def compose(raw, W, H, kicker, l1, l2):
    canvas = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(canvas)
    s = W / 1290
    d.text((90 * s, 150 * s), kicker, fill=ORANGE, font=font(int(38 * s)))
    d.text((90 * s, 215 * s), l1, fill=WHITE, font=font(int(92 * s)))
    d.text((90 * s, 320 * s), l2, fill=ORANGE, font=font(int(92 * s)))
    shot = Image.open(raw).convert('RGB')
    fw = int(W - 180 * s); fh = int(shot.height * fw / shot.width)
    shot = rounded(shot.resize((fw, fh), Image.LANCZOS), int(70 * s))
    top = int(600 * s)
    frame = Image.new('RGBA', (fw + 12, fh + 12), (60, 40, 30, 255))
    canvas.paste(frame, (int(90 * s) - 6, top - 6))
    canvas.paste(shot, (int(90 * s), top), shot)
    return canvas.crop((0, 0, W, H))

os.makedirs('store/ios/screenshots-6.5', exist_ok=True)
os.makedirs('store/android/screenshots', exist_ok=True)
for i, (raw, slug, l1, l2) in enumerate(CAPTIONS, 1):
    kicker = 'PROFOOD · LIVREUR'
    src = os.path.join(RAW, raw)
    compose(src, 1290, 2796, kicker, l1, l2).save(f'store/ios/screenshots/iphone-{i:02d}-{slug}.png')
    compose(src, 1284, 2778, kicker, l1, l2).save(f'store/ios/screenshots-6.5/iphone-{i:02d}-{slug}.png')
    compose(src, 1080, 2160, kicker, l1, l2).save(f'store/android/screenshots/android-{i:02d}-{slug}.png')
print('done')
