import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OldProductPage({ params }: Props) {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, { cache: "no-store" });
    if (res.ok) {
      const product = await res.json();
      redirect(`/shop/${product.slug || id}`);
    }
  } catch {
    // ignore
  }
  redirect("/shop");
}
