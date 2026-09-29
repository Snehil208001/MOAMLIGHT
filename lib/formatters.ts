/**
 * Formats an amount in Indian Rupees (INR) with standard Indian numbering convention.
 * e.g. 1299 -> "₹1,299", 14999 -> "₹14,999"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates discount percentage given original MRP and current selling price
 */
export function calculateDiscount(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
