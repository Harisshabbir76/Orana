"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";
import WishlistSidebar from "./WishlistSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/orana/");

  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <Footer />}
      {!isAdmin && <CartSidebar />}
      {!isAdmin && <WishlistSidebar />}
    </>
  );
}
