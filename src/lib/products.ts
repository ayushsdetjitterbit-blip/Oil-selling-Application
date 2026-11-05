export type Size = {
  id: string;
  label: string;
  litres: number;
  price: number;
  mrp: number;
  /** Units in stock. null = not tracked (no database connected). */
  stock?: number | null;
};
export type Rating = { avg: number; count: number };
export type Product = {
  slug: string;
  name: string;
  /** One word for the bottle label, e.g. "SESAME". */
  short: string;
  hindi: string;
  category: "Cooking" | "Wellness";
  tagline: string;
  description: string;
  uses: string[];
  color: string; // oil colour used for the bottle illustration
  tag?: string;
  sizes: Size[];
  /** From verified-buyer reviews in the database. */
  rating?: Rating | null;
  /** Units sold in the last 7 days, from real orders. */
  sold7d?: number;
};

export const MAX_QTY = 20;

/**
 * Default prices, used to seed the database. After setup, prices and stock are
 * edited in /admin/products. They are set near the middle of what Indian
 * wood-pressed (kachi ghani / marachekku) brands charged online in Nov 2026,
 * e.g. groundnut ₹350–599/L, sesame ₹400–799/L, coconut ₹720–1050/L, mustard ₹379–575/L.
 * [500ml, 1L, 5L] as [price, mrp] pairs.
 */
type Tier = [number, number];
const sizes = (half: Tier, litre: Tier, five: Tier): Size[] => [
  { id: "500ml", label: "500 ml", litres: 0.5, price: half[0], mrp: half[1] },
  { id: "1l", label: "1 litre", litres: 1, price: litre[0], mrp: litre[1] },
  { id: "5l", label: "5 litre tin", litres: 5, price: five[0], mrp: five[1] },
];

export const PRODUCTS: Product[] = [
  {
    slug: "groundnut-oil",
    short: "GROUNDNUT",
    name: "Groundnut Oil",
    hindi: "मूंगफली का तेल",
    category: "Cooking",
    tagline: "Rich, nutty everyday cooking oil",
    description:
      "Pressed slowly in a wooden kolhu from hand-sorted groundnuts. Nothing is added and nothing is removed, so the aroma and the golden colour stay natural.",
    uses: ["Deep frying", "Tadka & sabzi", "Pickles"],
    color: "#D9A21B",
    sizes: sizes([249, 299], [449, 549], [2099, 2499]),
  },
  {
    slug: "sesame-oil",
    short: "SESAME",
    name: "Sesame (Gingelly) Oil",
    hindi: "तिल का तेल",
    category: "Cooking",
    tagline: "Traditional til oil, wood pressed",
    description:
      "Made from clean white sesame seeds in a slow-turning kolhu. Deep flavour for South Indian cooking, and traditionally used for oil pulling and massage.",
    uses: ["Cooking", "Oil massage", "Podi & chutney"],
    color: "#C98A1C",
    tag: "Traditional",
    sizes: sizes([299, 349], [549, 650], [2599, 2999]),
  },
  {
    slug: "coconut-oil",
    short: "COCONUT",
    name: "Coconut Oil",
    hindi: "नारियल का तेल",
    category: "Cooking",
    tagline: "Pure from dry copra, no chemicals",
    description:
      "Wooden kolhu pressed from sun-dried coconut. Clear, fragrant and light. Good for cooking, hair and skin.",
    uses: ["Cooking", "Hair care", "Skin care"],
    color: "#EFE3B0",
    sizes: sizes([399, 475], [749, 950], [3499, 4250]),
  },
  {
    slug: "mustard-oil",
    short: "MUSTARD",
    name: "Kachi Ghani Mustard Oil",
    hindi: "सरसों का तेल",
    category: "Cooking",
    tagline: "Sharp, pungent, authentic kachi ghani",
    description:
      "Classic kachi ghani mustard oil, pressed cold with its natural pungency intact. Made for pickles, North Indian cooking and winter massage.",
    uses: ["Pickles", "Cooking", "Winter massage"],
    color: "#C9A51A",
    sizes: sizes([249, 299], [449, 550], [2099, 2499]),
  },
  {
    slug: "almond-oil",
    short: "ALMOND",
    name: "Sweet Almond Oil",
    hindi: "बादाम का तेल",
    category: "Wellness",
    tagline: "Light and nourishing, for skin and hair",
    description:
      "Slow-pressed from sweet almonds. A gentle, light oil for face, body, hair and baby massage. Not for frying.",
    uses: ["Face & body", "Hair", "Baby massage"],
    color: "#E7C766",
    tag: "New",
    sizes: [
      { id: "100ml", label: "100 ml", litres: 0.1, price: 349, mrp: 450 },
      { id: "250ml", label: "250 ml", litres: 0.25, price: 799, mrp: 999 },
    ],
  },
  {
    slug: "castor-oil",
    short: "CASTOR",
    name: "Castor Oil",
    hindi: "अरंडी का तेल",
    category: "Wellness",
    tagline: "Thick, pure oil for hair and brows",
    description:
      "Cold pressed from castor seeds. A thick, pure oil used traditionally for hair, eyebrows and joint massage.",
    uses: ["Hair & brows", "Joint massage"],
    color: "#D6B96A",
    sizes: [
      { id: "100ml", label: "100 ml", litres: 0.1, price: 149, mrp: 199 },
      { id: "250ml", label: "250 ml", litres: 0.25, price: 279, mrp: 349 },
    ],
  },
];

export function getProduct(slug: string, catalog: Product[] = PRODUCTS) {
  return catalog.find((p) => p.slug === slug);
}

/** variantId format: `${slug}:${sizeId}` */
export function findVariant(variantId: string, catalog: Product[] = PRODUCTS) {
  const [slug, sizeId] = variantId.split(":");
  const product = getProduct(slug ?? "", catalog);
  const size = product?.sizes.find((s) => s.id === sizeId);
  if (!product || !size) return null;
  return { product, size };
}

export const variantId = (slug: string, sizeId: string) => `${slug}:${sizeId}`;
export const fromPrice = (p: Product) => Math.min(...p.sizes.map((s) => s.price));
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const isSoldOut = (s: Size) => s.stock != null && s.stock <= 0;
export const maxQty = (s: Size) => Math.max(0, Math.min(MAX_QTY, s.stock ?? MAX_QTY));
export const perLitre = (s: Size) => Math.round(s.price / s.litres);
export const LOW_STOCK = 10;
