export interface Priced {
  price: number;
  discountedPrice?: number | null;
}

// True when the product has a valid sale price below its original price
export function hasDiscount(p: Priced): boolean {
  return p.discountedPrice !== null && p.discountedPrice !== undefined && p.discountedPrice < p.price;
}

// Price the customer actually pays
export function effectivePrice(p: Priced): number {
  return hasDiscount(p) ? (p.discountedPrice as number) : p.price;
}
