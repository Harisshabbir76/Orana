import ProductDetail from "../../components/product-description/ProductDetail";
import ExploreDesigns from "../../components/product-description/ExploreDesigns";
import Question from "../../components/shop/GotQuestions";
import Destination from "../../components/homepage/Destination";
import Instagram from "../../components/homepage/Instagram";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  let product = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/slug/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) product = await res.json();
  } catch {
    // backend offline
  }

  if (!product) {
    return (
      <div style={{ padding: "80px", textAlign: "center", fontFamily: "var(--font-body)", color: "#999" }}>
        Product not found.
      </div>
    );
  }

  return (
    <>
      <ProductDetail product={product} />
      <ExploreDesigns currentId={product._id} />
      <Question />
      <br />
      <Destination />
      <Instagram />
    </>
  );
}
