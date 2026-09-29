import type { Configuration, Product } from "./types";

// Approved MVP catalog: 05 - Data & API §10, in catalog order (desks, chairs,
// monitor, lamp, plant). Layer values are provisional working values (05 §14)
// and may change during artwork production. The asset files are produced in
// T8.

export const backdropSrc = "/workspace/backdrop.svg";

const verifiedAt = "2026-09-29";

export const catalog: readonly Product[] = [
  {
    id: "desk-mechanical-adjustable",
    name: "Mechanical Adjustable Desk",
    category: "desk",
    status: "verified",
    description: "Sit-stand desk with manual height adjustment, no electricity needed.",
    source: {
      url: "https://www.monis.rent/products/adjustable-wooden-desk",
      title: "Rent Mechanical Adjustable Desk in Bali | monis.rent",
      verifiedAt,
      note: "product page for Bali; manual sit-stand adjustment.",
    },
    asset: { src: "/workspace/products/desk-mechanical-adjustable.svg", layer: 20 },
  },
  {
    id: "desk-electrical-adjustable",
    name: "Electrical Adjustable Desk",
    category: "desk",
    status: "verified",
    description: "Sit-stand desk with quiet electric height adjustment.",
    source: {
      url: "https://www.monis.rent/products/electrical-adjustable-desk",
      title: "Rent Electrical Adjustable Desk in Bali | monis.rent",
      verifiedAt,
      note: "product page for Bali; electric sit-stand adjustment.",
    },
    asset: { src: "/workspace/products/desk-electrical-adjustable.svg", layer: 20 },
  },
  {
    id: "chair-ergonomic-office",
    name: "Ergonomic Office Chair",
    category: "chair",
    status: "verified",
    description: "Mesh-back ergonomic chair with adjustable headrest and armrests.",
    source: {
      url: "https://www.monis.rent/products/ergonomic-office-chair",
      title: "Rent Ergonomic Office Chair in Bali | monis.rent",
      verifiedAt,
      note: "product page for Bali; mesh-back ergonomic chair.",
    },
    asset: { src: "/workspace/products/chair-ergonomic-office.svg", layer: 50 },
  },
  {
    id: "chair-cane-back",
    name: "Cane-back Chair",
    category: "chair",
    status: "illustrative",
    description: "A woven cane-back chair in natural tones.",
    asset: { src: "/workspace/products/chair-cane-back.svg", layer: 50 },
  },
  {
    id: "monitor-24-full-hd-1c",
    name: '24" Full HD Office Monitor 1C',
    category: "monitor",
    status: "verified",
    description: "Full HD office monitor.",
    source: {
      url: "https://www.monis.rent/products/full-hd-office-24",
      title: 'Rent 24" Full HD Office Monitor 1C in Bali | monis.rent',
      verifiedAt,
      note: "product page for Bali; Full HD office monitor.",
    },
    asset: { src: "/workspace/products/monitor-24-full-hd-1c.svg", layer: 30 },
  },
  {
    id: "lamp-smart-led-1s",
    name: "Smart LED Desk Lamp 1S",
    category: "lamp",
    status: "verified",
    description: "Smart LED desk lamp with adjustable colour temperature.",
    source: {
      url: "https://www.monis.rent/products/smart-led-desk-lamp-1-s",
      title: "Rent Smart LED Desk Lamp 1S in Bali | monis.rent",
      verifiedAt,
      note: "product page for Bali; LED desk lamp.",
    },
    asset: { src: "/workspace/products/lamp-smart-led-1s.svg", layer: 40 },
  },
  {
    id: "plant-floor",
    name: "Floor Plant",
    category: "plant",
    status: "illustrative",
    description: "A leafy potted floor plant.",
    asset: { src: "/workspace/products/plant-floor.svg", layer: 10 },
  },
];

// The desk and chair from Monis's "The Essentials" bundle (05 §11). This is
// also the Start Over target (03 §26.2); it implies nothing about availability.
export const initialConfiguration: Configuration = {
  deskId: "desk-electrical-adjustable",
  chairId: "chair-ergonomic-office",
  accessoryIds: [],
};
