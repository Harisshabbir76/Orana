import ShopPage from "../components/shop/ShopPage";
import GotQuestions from "../components/shop/GotQuestions";
import Instagram from "../components/homepage/Instagram";
import { PageCMSProvider } from "../context/PageCMSContext";

export default async function Shop() {
  let initialProducts = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, { cache: "no-store" });
    if (res.ok) initialProducts = await res.json();
  } catch { /* backend offline */ }

  return (
    <PageCMSProvider page="shop">
      <ShopPage initialProducts={initialProducts} />
      <GotQuestions />
      <br/>
      <br/>
      <Instagram/>
    </PageCMSProvider>
  );
}
