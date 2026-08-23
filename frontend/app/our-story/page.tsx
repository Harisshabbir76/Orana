import AboutHero from "../components/about-us/HeroSection";
import Born from "../components/about-us/Born";
import DesignedForWoman from "../components/about-us/DesignedForWoman";
import AboutMarquee from "../components/about-us/AboutMarquee";
import OrangeSoul from "../components/about-us/OrangeSoul";
import Destination from "../components/homepage/Destination";
import Instagram from "../components/homepage/Instagram";
import { PageCMSProvider } from "../context/PageCMSContext";

export default function OurStoryPage() {
  return (
    <PageCMSProvider page="about">
      <main>
        <AboutHero />
        <Born />
        <DesignedForWoman />
        <AboutMarquee />
        <OrangeSoul />
        <br/>
        <Destination/>
        <Instagram/>
      </main>
    </PageCMSProvider>
  );
}
