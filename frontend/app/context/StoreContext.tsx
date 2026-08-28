"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "./AuthContext";

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
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<StoreProduct[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const skipSave = useRef(true);
  const skipWishlistSave = useRef(true);
  const syncDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncWishlistDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevToken = useRef<string | null>(null);

  // Rehydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("orana_cart");
      if (storedCart) setCartItems(JSON.parse(storedCart));
      const storedWishlist = localStorage.getItem("orana_wishlist");
      if (storedWishlist) setWishlistItems(JSON.parse(storedWishlist));
    } catch {}
  }, []);

  // On login: fetch server cart/wishlist and merge with local
  useEffect(() => {
    if (token && !prevToken.current) {
      const headers = { Authorization: `Bearer ${token}` };
      Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, { headers }).then((r) => r.json()).catch(() => ({ cart: [] })),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, { headers }).then((r) => r.json()).catch(() => ({ wishlist: [] })),
      ]).then(([cartData, wishlistData]) => {
        const serverCart: CartItem[] = cartData.cart ?? [];
        const serverWishlist: StoreProduct[] = cartData.wishlist ?? wishlistData.wishlist ?? [];

        setCartItems((local) => {
          const merged = [...local];
          serverCart.forEach((si) => {
            const idx = merged.findIndex((li) => li.product._id === si.product._id);
            if (idx === -1) merged.push(si);
            else merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + si.quantity };
          });
          return merged;
        });

        setWishlistItems((local) => {
          const merged = [...local];
          serverWishlist.forEach((si) => {
            if (!merged.find((li) => li._id === si._id)) merged.push(si);
          });
          return merged;
        });
      });
    }
    prevToken.current = token;
  }, [token]);

  // Persist cart — skip the very first run (cartItems is still [] then)
  useEffect(() => {
    if (skipSave.current) { skipSave.current = false; return; }
    localStorage.setItem("orana_cart", JSON.stringify(cartItems));
    if (token) {
      if (syncDebounce.current) clearTimeout(syncDebounce.current);
      syncDebounce.current = setTimeout(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: cartItems }),
        }).catch(() => {});
      }, 500);
    }
  }, [cartItems, token]);

  // Persist wishlist — skip the very first run
  useEffect(() => {
    if (skipWishlistSave.current) { skipWishlistSave.current = false; return; }
    localStorage.setItem("orana_wishlist", JSON.stringify(wishlistItems));
    if (token) {
      if (syncWishlistDebounce.current) clearTimeout(syncWishlistDebounce.current);
      syncWishlistDebounce.current = setTimeout(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: wishlistItems }),
        }).catch(() => {});
      }, 500);
    }
  }, [wishlistItems, token]);

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
