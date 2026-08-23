import HeroSection from "./components/homepage/HeroSection";
import Designed from "./components/homepage/Designed";
import Marquee from "./components/homepage/Marquee";
import Collection from "./components/homepage/Collection";
import Effortless from "./components/homepage/Effortless";
import Inspired from "./components/homepage/Inspired";
import Destination from "./components/homepage/Destination";
import Instagram from "./components/homepage/Instagram";
import HomepageCMSWrapper from "./components/HomepageCMSWrapper";

export default async function Home() {
  let initialProducts = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?homepage=true`, { cache: "no-store" });
    if (res.ok) initialProducts = await res.json();
  } catch { /* backend offline */ }

  return (
    <HomepageCMSWrapper>
      <main>
        <HeroSection />
        <Designed />
        <Marquee />
        <Collection initialProducts={initialProducts} />
        <Effortless />
        <Inspired />
        <Destination />
        <Instagram />
      </main>
    </HomepageCMSWrapper>
  );
}
