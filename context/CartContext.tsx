'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { CartItem, AppliedCoupon, CartContextType } from '@/types/cart';
import {
  createCart,
  addToCart,
  updateCart,
  removeFromCart,
  getCart,
  applyDiscountCodes,
  updateCartAttributes,
  ShopifyCart,
} from '@/src/integrations/shopify';

const STORAGE_KEY = 'moamlight_cart_v1';
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isGift, setIsGift] = useState<boolean>(false);
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Shopify sync state
  const [shopifyCartId, setShopifyCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Synchronization tracking refs to avoid race conditions and stale closures
  const syncCounterRef = useRef<number>(0);
  const cartIdRef = useRef<string | null>(null);
  const inFlightCartPromiseRef = useRef<Promise<ShopifyCart | null> | null>(null);
  const isGiftRef = useRef<boolean>(isGift);
  const giftMessageRef = useRef<string>(giftMessage);
  const couponRef = useRef<string | null>(appliedCouponCode);

  useEffect(() => {
    isGiftRef.current = isGift;
  }, [isGift]);

  useEffect(() => {
    giftMessageRef.current = giftMessage;
  }, [giftMessage]);

  useEffect(() => {
    couponRef.current = appliedCouponCode;
  }, [appliedCouponCode]);

  useEffect(() => {
    cartIdRef.current = shopifyCartId;
  }, [shopifyCartId]);

  const startSync = useCallback(() => {
    syncCounterRef.current += 1;
    setIsSyncing(true);
  }, []);

  const endSync = useCallback(() => {
    syncCounterRef.current = Math.max(0, syncCounterRef.current - 1);
    if (syncCounterRef.current === 0) {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Reconciles remote Shopify cart response with local items and state.
   */
  const reconcileCart = useCallback((cart: ShopifyCart) => {
    setShopifyCartId(cart.id);
    cartIdRef.current = cart.id;
    if (cart.checkoutUrl) {
      setCheckoutUrl(cart.checkoutUrl);
    }

    if (cart.lines?.edges?.length) {
      setItems((prevItems) => {
        return prevItems.map((item) => {
          const matchedEdge = cart.lines.edges.find((e) => {
            if (e.node.merchandise.id !== item.variantId) return false;
            if (item.engravingText) {
              const engAttr = e.node.attributes?.find(
                (a) => a.key === 'Engraving' || a.key === 'Engraving Text'
              );
              return engAttr?.value === item.engravingText.trim();
            }
            const isEngravedEdge = e.node.attributes?.some(
              (a) => a.key === 'Engraving' || a.key === 'Engraving Text' || a.key === '_engraved'
            );
            return !isEngravedEdge;
          });
          if (matchedEdge) {
            return {
              ...item,
              shopifyLineId: matchedEdge.node.id,
            };
          }
          return item;
        });
      });
    }
  }, []);

  // Load cart from localStorage on mount (hydration safe)
  useEffect(() => {
    let savedCartId: string | null = null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.isGift !== undefined) setIsGift(Boolean(parsed.isGift));
        if (parsed.giftMessage) setGiftMessage(String(parsed.giftMessage));
        if (parsed.appliedCouponCode) setAppliedCouponCode(String(parsed.appliedCouponCode));
        if (parsed.shopifyCartId) {
          savedCartId = String(parsed.shopifyCartId);
          setShopifyCartId(savedCartId);
          cartIdRef.current = savedCartId;
        }
        if (parsed.checkoutUrl) setCheckoutUrl(String(parsed.checkoutUrl));
      }
    } catch (e) {
      console.error('Failed to load cart state from localStorage', e);
    } finally {
      setIsInitialized(true);
    }

    // Verify existing cart with Shopify if cart ID was rehydrated
    if (savedCartId) {
      startSync();
      getCart(savedCartId)
        .then((remoteCart) => {
          if (remoteCart) {
            reconcileCart(remoteCart);
          } else {
            console.warn('[CartContext] Remote Shopify cart no longer valid; resetting cart ID');
            setShopifyCartId(null);
            cartIdRef.current = null;
            setCheckoutUrl(null);
          }
        })
        .catch((err) => {
          console.warn('[CartContext] Failed to rehydrate remote cart from Shopify:', err);
        })
        .finally(() => {
          endSync();
        });
    }
  }, [reconcileCart, startSync, endSync]);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const payload = {
        items,
        isGift,
        giftMessage,
        appliedCouponCode,
        shopifyCartId,
        checkoutUrl,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save cart state to localStorage', e);
    }
  }, [items, isGift, giftMessage, appliedCouponCode, shopifyCartId, checkoutUrl, isInitialized]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  /**
   * Adds an item to the cart with instant optimistic UI update
   * and background Shopify cart synchronization.
   */
  const addItem = (
    itemData: Omit<CartItem, 'quantity' | 'id' | 'shopifyLineId'>,
    quantity: number = 1
  ) => {
    // Unique composite ID ensuring engraved candles have separate line items
    const engravingSuffix = itemData.engravingText
      ? `-engraved-${encodeURIComponent(itemData.engravingText.trim().toLowerCase())}`
      : '';
    const compositeId = `${itemData.productId}-${itemData.variantId}${engravingSuffix}`;

    // 1. Optimistic UI update
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === compositeId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { ...itemData, id: compositeId, quantity }];
    });
    setIsOpen(true);

    // 2. Background Shopify sync with custom Line Item Properties
    startSync();
    (async () => {
      try {
        // Await in-flight cart creation if one is currently processing
        if (inFlightCartPromiseRef.current) {
          await inFlightCartPromiseRef.current;
        }

        const lineAttributes = itemData.engravingText
          ? [
              { key: 'Engraving', value: itemData.engravingText.trim() },
              { key: 'Engraving Text', value: itemData.engravingText.trim() },
              { key: 'Engraving Font', value: itemData.engravingFont || 'Royal Atelier Serif' },
              { key: '_engraved', value: 'true' },
              ...(itemData.attributes || []),
            ]
          : itemData.attributes;

        const lineInput = {
          merchandiseId: itemData.variantId,
          quantity,
          attributes: lineAttributes,
        };

        const currentCartId = cartIdRef.current;
        if (!currentCartId) {
          // Prepare cart attributes & discount codes if already set
          const cartAttributes = isGiftRef.current
            ? [
                { key: 'is_gift', value: 'true' },
                { key: 'gift_message', value: giftMessageRef.current },
              ]
            : undefined;
          const discountCodes = couponRef.current ? [couponRef.current] : undefined;

          const createPromise = createCart(
            [lineInput],
            cartAttributes,
            discountCodes
          );
          inFlightCartPromiseRef.current = createPromise;
          const newCart = await createPromise;
          inFlightCartPromiseRef.current = null;

          if (newCart) {
            reconcileCart(newCart);
          }
        } else {
          const updated = await addToCart(currentCartId, [lineInput]);
          if (updated) {
            reconcileCart(updated);
          }
        }
      } catch (err) {
        console.error('[CartContext] Failed to sync item to Shopify:', err);
      } finally {
        endSync();
      }
    })();
  };

  /**
   * Updates item quantity with optimistic UI update and background sync.
   */
  const updateQuantity = (id: string, quantity: number) => {
    const existing = items.find((item) => item.id === id);
    if (!existing) return;

    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    // 1. Optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

    // 2. Background Shopify sync
    const currentCartId = cartIdRef.current;
    if (currentCartId) {
      const lineId = existing.shopifyLineId || id;
      startSync();
      updateCart(currentCartId, [{ id: lineId, quantity }])
        .then((updated) => {
          if (updated) reconcileCart(updated);
        })
        .catch((err) => {
          console.error('[CartContext] Failed to sync quantity update:', err);
        })
        .finally(() => {
          endSync();
        });
    }
  };

  /**
   * Removes an item from the cart with optimistic UI update and background sync.
   */
  const removeItem = (id: string) => {
    const existing = items.find((item) => item.id === id);

    // 1. Optimistic update
    setItems((prev) => prev.filter((item) => item.id !== id));

    // 2. Background Shopify sync
    const currentCartId = cartIdRef.current;
    if (currentCartId && existing) {
      const lineId = existing.shopifyLineId || id;
      startSync();
      removeFromCart(currentCartId, [lineId])
        .then((updated) => {
          if (updated) reconcileCart(updated);
        })
        .catch((err) => {
          console.error('[CartContext] Failed to sync item removal:', err);
        })
        .finally(() => {
          endSync();
        });
    }
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCouponCode(null);
    setIsGift(false);
    setGiftMessage('');
    setShopifyCartId(null);
    cartIdRef.current = null;
    setCheckoutUrl(null);
  };

  /**
   * Updates gift options locally and synchronizes attributes with Shopify cart.
   */
  const setGiftOptions = (gift: boolean, message: string) => {
    setIsGift(gift);
    setGiftMessage(message);

    const currentCartId = cartIdRef.current;
    if (currentCartId) {
      startSync();
      updateCartAttributes(currentCartId, [
        { key: 'is_gift', value: String(gift) },
        { key: 'gift_message', value: message },
      ])
        .then((updated) => {
          if (updated?.checkoutUrl) setCheckoutUrl(updated.checkoutUrl);
        })
        .catch((err) => {
          console.error('[CartContext] Failed to sync gift attributes to Shopify:', err);
        })
        .finally(() => {
          endSync();
        });
    }
  };

  // Calculations
  const { totalItemsCount, subtotal } = useMemo(() => {
    let totalItemsCount = 0;
    let subtotal = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      totalItemsCount += item.quantity;
      subtotal += item.price * item.quantity;
    }
    return { totalItemsCount, subtotal };
  }, [items]);

  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingFee = items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;

  // Coupon handling
  const appliedCoupon = useMemo<AppliedCoupon | null>(() => {
    if (!appliedCouponCode) return null;
    const cleanCode = appliedCouponCode.toUpperCase();
    if (cleanCode === 'MOAM10') {
      const discountPercentage = 10;
      const discountAmount = Math.round((subtotal * discountPercentage) / 100);
      return {
        code: 'MOAM10',
        discountPercentage,
        discountAmount,
      };
    }
    return null;
  }, [appliedCouponCode, subtotal]);

  const discountTotal = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountTotal + shippingFee);

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === 'MOAM10') {
      setAppliedCouponCode('MOAM10');

      const currentCartId = cartIdRef.current;
      if (currentCartId) {
        startSync();
        applyDiscountCodes(currentCartId, [formatted])
          .then((updated) => {
            if (updated?.checkoutUrl) setCheckoutUrl(updated.checkoutUrl);
          })
          .catch((err) => {
            console.error('[CartContext] Failed to apply discount code on Shopify:', err);
          })
          .finally(() => {
            endSync();
          });
      }

      return { success: true, message: 'Coupon MOAM10 applied: 10% discount unlocked!' };
    }
    return { success: false, message: `Coupon "${code}" is invalid or expired. Try "MOAM10"` };
  };

  const removeCoupon = () => {
    setAppliedCouponCode(null);
    const currentCartId = cartIdRef.current;
    if (currentCartId) {
      startSync();
      applyDiscountCodes(currentCartId, [])
        .then((updated) => {
          if (updated?.checkoutUrl) setCheckoutUrl(updated.checkoutUrl);
        })
        .catch((err) => {
          console.error('[CartContext] Failed to clear discount code on Shopify:', err);
        })
        .finally(() => {
          endSync();
        });
    }
  };

  /**
   * Redirects user to Shopify-hosted checkout URL.
   * If cart hasn't been created yet on Shopify, creates it on-demand first.
   * Falls back gracefully to internal /checkout in offline/mock mode.
   */
  const redirectToCheckout = async (): Promise<void> => {
    startSync();
    try {
      let currentCheckoutUrl = checkoutUrl;
      let currentCartId = cartIdRef.current;

      // If cart doesn't exist yet on Shopify but we have items, create it now
      if ((!currentCartId || !currentCheckoutUrl) && items.length > 0) {
        const lineInputs = items.map((item) => ({
          merchandiseId: item.variantId,
          quantity: item.quantity,
          attributes: item.engravingText
            ? [
                { key: 'Engraving', value: item.engravingText.trim() },
                { key: 'Engraving Text', value: item.engravingText.trim() },
                { key: 'Engraving Font', value: item.engravingFont || 'Royal Atelier Serif' },
                { key: '_engraved', value: 'true' },
                ...(item.attributes || []),
              ]
            : item.attributes,
        }));
        const attributes = isGiftRef.current
          ? [
              { key: 'is_gift', value: 'true' },
              { key: 'gift_message', value: giftMessageRef.current },
            ]
          : undefined;
        const discountCodes = couponRef.current ? [couponRef.current] : undefined;

        const cart = await createCart(lineInputs, attributes, discountCodes);
        if (cart) {
          reconcileCart(cart);
          currentCheckoutUrl = cart.checkoutUrl;
        }
      }

      if (currentCheckoutUrl) {
        window.location.href = currentCheckoutUrl;
        return;
      }

      // Default fallback if no remote checkout URL is configured
      window.location.href = '/checkout';
    } catch (err) {
      console.error('[CartContext] redirectToCheckout failed:', err);
      window.location.href = '/checkout';
    } finally {
      endSync();
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        discountTotal,
        shippingFee,
        finalTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        hasFreeShipping,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isGift,
        giftMessage,
        setGiftOptions,
        shopifyCartId,
        checkoutUrl,
        isSyncing,
        redirectToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
