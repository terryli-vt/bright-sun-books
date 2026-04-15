export const SURCHARGE_RATE = 0.05;

export interface PricedLine {
  price: number;
  quantity: number;
}

export function computeTotals(items: PricedLine[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const surcharge = subtotal * SURCHARGE_RATE;
  return { subtotal, surcharge, total: subtotal + surcharge };
}
