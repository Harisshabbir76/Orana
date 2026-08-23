import { cookies } from "next/headers";
import AdminLogin from "../../components/admin/AdminLogin";
import AdminDashboard from "../../components/admin/AdminDashboard";

export default async function AdminPanel() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth");
  const secret = process.env.ADMIN_SECRET || "orana_admin";
  const isAuthenticated = token?.value === secret;

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  let initialProducts = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, { cache: "no-store" });
    if (res.ok) initialProducts = await res.json();
  } catch { /* backend offline */ }

  return <AdminDashboard initialProducts={initialProducts} />;
}
