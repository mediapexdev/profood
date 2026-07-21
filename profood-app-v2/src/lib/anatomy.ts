/**
 * Planches de découpe boucher : illustrations gravure (style référence PROFOOD)
 * avec zones de surbrillance positionnées en % au-dessus de l'image.
 */

export type Animal = "boeuf" | "mouton" | "volaille";

export type BitmapZone = {
  label: string;
  /** Ellipse en coordonnées % de l'image (0-100). */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type BitmapDiagram = {
  src: string;
  zones: Record<string, BitmapZone>;
};

export const DIAGRAMS: Record<Animal, BitmapDiagram> = {
  boeuf: {
    src: "/images/cuts/boeuf.png",
    zones: {
      tete: { label: "Tête & langue", cx: 11, cy: 30, rx: 11, ry: 22 },
      collier: { label: "Collier", cx: 26, cy: 38, rx: 6, ry: 22 },
      epaule: { label: "Épaule & paleron", cx: 36, cy: 50, rx: 9, ry: 17 },
      cote: { label: "Côtes & entrecôte", cx: 39, cy: 30, rx: 8, ry: 13 },
      fauxfilet: { label: "Faux-filet", cx: 53, cy: 29, rx: 8, ry: 12 },
      filet: { label: "Filet", cx: 65, cy: 30, rx: 6, ry: 12 },
      rumsteck: { label: "Rumsteck", cx: 74, cy: 31, rx: 5, ry: 13 },
      cuisse: { label: "Cuisse & gîte", cx: 84, cy: 43, rx: 8, ry: 19 },
      poitrine: { label: "Poitrine", cx: 51, cy: 56, rx: 9, ry: 12 },
      flanchet: { label: "Bavette & flanchet", cx: 67, cy: 54, rx: 8, ry: 10 },
      jarret: { label: "Jarret", cx: 37, cy: 77, rx: 5, ry: 11 },
      queue: { label: "Queue", cx: 93, cy: 42, rx: 5, ry: 26 },
    },
  },
  mouton: {
    src: "/images/cuts/mouton.png",
    zones: {
      tete: { label: "Tête", cx: 11, cy: 20, rx: 10, ry: 13 },
      collier: { label: "Collier", cx: 25, cy: 30, rx: 6, ry: 15 },
      epaule: { label: "Épaule", cx: 36, cy: 47, rx: 9, ry: 15 },
      carre: { label: "Côtelettes (carré)", cx: 53, cy: 33, rx: 8, ry: 14 },
      filet: { label: "Côte de filet", cx: 66, cy: 34, rx: 7, ry: 14 },
      poitrine: { label: "Poitrine", cx: 57, cy: 56, rx: 12, ry: 9 },
      gigot: { label: "Gigot", cx: 79, cy: 45, rx: 9, ry: 16 },
      souris: { label: "Souris", cx: 79, cy: 68, rx: 6, ry: 10 },
    },
  },
  volaille: {
    src: "/images/cuts/volaille.png",
    zones: {
      dos: { label: "Dos & carcasse", cx: 52, cy: 18, rx: 24, ry: 12 },
      blanc: { label: "Blanc (poitrine)", cx: 33, cy: 57, rx: 11, ry: 20 },
      aile: { label: "Aile", cx: 53, cy: 44, rx: 15, ry: 13 },
      cuisse: { label: "Haut de cuisse", cx: 59, cy: 66, rx: 10, ry: 11 },
      pilon: { label: "Pilon", cx: 55, cy: 83, rx: 9, ry: 10 },
    },
  },
};

type CutInfo = {
  animal: Animal;
  /** Zone(s) en surbrillance ; vide = animal entier. */
  zones: string[];
  /** Libellé spécifique (abats, préparations…). */
  note?: string;
};

const Z = (animal: Animal, zones: string[], note?: string): CutInfo => ({
  animal,
  zones,
  note,
});

export const CUT_MAP: Record<string, CutInfo> = {
  // ── Bœuf ────────────────────────────────────────────────────────
  "Basse côte sans os": Z("boeuf", ["cote"]),
  "Côte de boeuf": Z("boeuf", ["cote"]),
  "Entrecôte de boeuf": Z("boeuf", ["cote"]),
  "T-bone": Z("boeuf", ["fauxfilet", "filet"]),
  "Faux filet": Z("boeuf", ["fauxfilet"]),
  "Brochette de faux filet": Z("boeuf", ["fauxfilet"]),
  "Filet de boeuf": Z("boeuf", ["filet"]),
  "Brochette de filet de boeuf": Z("boeuf", ["filet"]),
  Tournedos: Z("boeuf", ["filet"]),
  "Rumsteak de boeuf": Z("boeuf", ["rumsteck"]),
  "Collier sans os": Z("boeuf", ["collier"]),
  Paleron: Z("boeuf", ["epaule"]),
  Bourguignon: Z("boeuf", ["epaule"]),
  "Sauté de boeuf avec os": Z("boeuf", ["epaule"]),
  "Sauté de boeuf sans os": Z("boeuf", ["epaule"]),
  "Blanquette de veau": Z("boeuf", ["epaule"], "Veau"),
  "Escaloppe de veau": Z("boeuf", ["cuisse"], "Veau"),
  "Cuisse de boeuf découpé": Z("boeuf", ["cuisse"]),
  "Gite de boeuf": Z("boeuf", ["cuisse"]),
  "Noix de boeuf": Z("boeuf", ["cuisse"]),
  "Tranche grasse": Z("boeuf", ["cuisse"]),
  "Rôti de boeuf": Z("boeuf", ["cuisse"]),
  "Émincé de boeuf": Z("boeuf", ["cuisse"]),
  "Viande à brochette": Z("boeuf", ["cuisse"]),
  Bavette: Z("boeuf", ["flanchet"]),
  "Jarret avec os": Z("boeuf", ["jarret"]),
  "Osso bucco": Z("boeuf", ["jarret"]),
  "Queue de boeuf": Z("boeuf", ["queue"]),
  "Langue entière de boeuf": Z("boeuf", ["tete"]),
  "Coeur de boeuf": Z("boeuf", [], "Abats"),
  "Coeur de boeuf tranché": Z("boeuf", [], "Abats"),
  "Foie de boeuf": Z("boeuf", [], "Abats"),
  "Rognon de boeuf": Z("boeuf", [], "Abats"),
  "Boulette de viande": Z("boeuf", [], "Préparation bouchère"),
  Merguez: Z("boeuf", [], "Préparation bouchère"),
  "Steak haché hamburger": Z("boeuf", [], "Préparation bouchère"),
  "Viande hachée": Z("boeuf", [], "Préparation bouchère"),
  "Viande hachée 1er choix": Z("boeuf", [], "Préparation bouchère"),
  "Viande hachée pour animaux": Z("boeuf", [], "Préparation bouchère"),

  // ── Mouton / agneau ─────────────────────────────────────────────
  "Cotelettes d'agneau": Z("mouton", ["carre"]),
  "Côte de filet d'agneau": Z("mouton", ["filet"]),
  "Épaule d'agneau": Z("mouton", ["epaule"]),
  "Épaule d'agneau desossé": Z("mouton", ["epaule"]),
  "Sauté d'agneau avec os": Z("mouton", ["epaule"]),
  "Sauté d'agneau sans os": Z("mouton", ["epaule"]),
  "Gigot d'agneau desossé": Z("mouton", ["gigot"]),
  "Gigot de mouton desossé": Z("mouton", ["gigot"]),
  "Gigot de mouton tranché": Z("mouton", ["gigot"]),
  "Rôti de gigot de mouton désossé": Z("mouton", ["gigot"]),
  "Souris d'agneau": Z("mouton", ["souris"]),
  "Tête de mouton": Z("mouton", ["tete"]),
  "Foie de mouton": Z("mouton", [], "Abats"),
  "Rognon de mouton": Z("mouton", [], "Abats"),
  "Agneau entier local": Z("mouton", [], "Animal entier"),
  "Mouton entier decoupé": Z("mouton", [], "Animal entier"),

  // ── Volaille ────────────────────────────────────────────────────
  "Aile de poulet": Z("volaille", ["aile"]),
  "Blanc de poulet": Z("volaille", ["blanc"]),
  "Cuisse de poulet": Z("volaille", ["cuisse", "pilon"]),
  "Haut de cuisse de poulet": Z("volaille", ["cuisse"]),
  "Pilon de poulet": Z("volaille", ["pilon"]),
  "Poulet entier": Z("volaille", [], "Animal entier"),
};

export function getCutInfo(sliceName: string): CutInfo | null {
  return CUT_MAP[sliceName] ?? null;
}

export function zoneLabels(info: CutInfo): string {
  if (info.zones.length === 0) return info.note ?? "";
  const d = DIAGRAMS[info.animal];
  const labels = info.zones
    .map((z) => d.zones[z]?.label)
    .filter(Boolean)
    .join(" + ");
  return info.note ? `${labels} · ${info.note}` : labels;
}
