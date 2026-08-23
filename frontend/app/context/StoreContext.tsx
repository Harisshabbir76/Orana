"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

export interface StoreProduct {
  _id: string;
  name: string;
  price: number;
  images: { url: string; publicId: string }[];
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

interface StoreCtx {
  cartItems: CartItem[];
  wishlistItems: StoreProduct[];
  cartOpen: boolean;
  wishlistOpen: boolean;
  addToCart: (p: StoreProduct) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  addToWishlist: (p: StoreProduct) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const StoreContext = createContext<StoreCtx>({
  cartItems: [], wishlistItems: [],
  cartOpen: false, wishlistOpen: false,
  addToCart: () => {}, removeFromCart: () => {}, updateQty: () => {}, clearCart: () => {},
  addToWishlist: () => {}, removeFromWishlist: () => {}, isInWishlist: () => false,
  openCart: () => {}, closeCart: () => {}, openWishlist: () => {}, closeWishlist: () => {},
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<StoreProduct[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const skipSave = useRef(true);
  const skipWishlistSave = useRef(true);

  // Rehydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("orana_cart");
      if (storedCart) setCartItems(JSON.parse(storedCart));
      const storedWishlist = localStorage.getItem("orana_wishlist");
      if (storedWishlist) setWishlistItems(JSON.parse(storedWishlist));
    } catch {}
  }, []);

  // Persist cart — skip the very first run (cartItems is still [] then)
  useEffect(() => {
    if (skipSave.current) { skipSave.current = false; return; }
    localStorage.setItem("orana_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist wishlist — skip the very first run
  useEffect(() => {
    if (skipWishlistSave.current) { skipWishlistSave.current = false; return; }
    localStorage.setItem("orana_wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToCart = (p: StoreProduct) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product._id === p._id);
      if (existing) return prev.map(i => i.product._id === p._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(i => i.product._id !== id));
  const clearCart = () => setCartItems([]);

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCartItems(prev => prev.map(i => i.product._id === id ? { ...i, quantity: qty } : i));
  };

  const addToWishlist = (p: StoreProduct) => {
    setWishlistItems(prev => prev.find(i => i._id === p._id) ? prev.filter(i => i._id !== p._id) : [...prev, p]);
  };

  const removeFromWishlist = (id: string) => setWishlistItems(prev => prev.filter(i => i._id !== id));

  const isInWishlist = (id: string) => wishlistItems.some(i => i._id === id);

  return (
    <StoreContext.Provider value={{
      cartItems, wishlistItems, cartOpen, wishlistOpen,
      addToCart, removeFromCart, updateQty, clearCart,
      addToWishlist, removeFromWishlist, isInWishlist,
      openCart: () => { setCartOpen(true); setWishlistOpen(false); },
      closeCart: () => setCartOpen(false),
      openWishlist: () => { setWishlistOpen(true); setCartOpen(false); },
      closeWishlist: () => setWishlistOpen(false),
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
