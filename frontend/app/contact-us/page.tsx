import ContactHeroSection from "../components/contact-us/HeroSection";
import ContactForm from "../components/contact-us/ContactForm";
import Destination from "../components/homepage/Destination";
import Instagram from "../components/homepage/Instagram";
import { PageCMSProvider } from "../context/PageCMSContext";

export default function ContactUsPage() {
  return (
    <PageCMSProvider page="contact">
      <div style={{ background: "#FFF5F2" }}>
        <ContactHeroSection />
        <ContactForm />
        <div style={{ height: "20px", background: "white" }} />
        <Destination/>
        <Instagram/>
      </div>
    </PageCMSProvider>
  );
}
