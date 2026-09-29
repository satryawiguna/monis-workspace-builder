// Product data contract: 05 - Data & API §5; configuration: 03 - Architecture §9.

export type ProductId = string;

export type Category = "desk" | "chair" | "monitor" | "lamp" | "plant";
export type AccessoryCategory = "monitor" | "lamp" | "plant";

// "verified" = observed on an official Monis Bali page on the recorded date
// (UI label "Seen on Monis Bali"). It never means available, in stock or
// rentable. "illustrative" = visual representation only (UI label
// "Illustrative").
export type ContentStatus = "verified" | "illustrative";

// Traceability for the "Seen on Monis Bali" claim; never fetched or linked at
// runtime.
export interface ProductSource {
  url: string;
  title: string;
  verifiedAt: string; // ISO date the source was checked
  note: string; // what the page establishes
}

export interface ProductAsset {
  src: string; // /workspace/products/<id>.svg, drawn on the shared 1200×800 artboard
  layer: number; // stacking order; 0 is reserved for the backdrop
  offset?: { x: number; y: number }; // artboard units, only if a desk variant needs it
}

interface BaseProduct {
  id: ProductId;
  name: string;
  category: Category;
  description?: string;
  asset: ProductAsset;
}

export interface VerifiedProduct extends BaseProduct {
  status: "verified";
  source: ProductSource;
}

export interface IllustrativeProduct extends BaseProduct {
  status: "illustrative";
  source?: never;
}

export type Product = VerifiedProduct | IllustrativeProduct;

export interface Configuration {
  deskId: ProductId; // exactly one (SR-1)
  chairId: ProductId; // exactly one (SR-2)
  accessoryIds: ProductId[]; // zero or more, unique, no quantities (SR-3)
}
