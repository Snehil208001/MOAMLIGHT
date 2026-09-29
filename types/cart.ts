export interface CartItem {
  id: string; // Composite unique key: `${productId}-${variantId}`
  productId: string;
  title: string;
  scentProfile: string;
  variantId: string;
  variantName: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  weightGrams: number;
  shopifyLineId?: string;
}

export interface AppliedCoupon {
  code: string;
  discountPercentage: number;
  discountAmount: number;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity' | 'id' | 'shopifyLineId'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  finalTotal: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  hasFreeShipping: boolean;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isGift: boolean;
  giftMessage: string;
  setGiftOptions: (isGift: boolean, message: string) => void;
  shopifyCartId?: string | null;
  checkoutUrl?: string | null;
  isSyncing?: boolean;
  redirectToCheckout?: () => Promise<void>;
}

