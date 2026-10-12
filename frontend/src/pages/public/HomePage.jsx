import { useEffect } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { HeroSection } from '../../components/public/HeroSection';
import { AboutSection } from '../../components/public/AboutSection';
import { ServicesSection } from '../../components/public/ServicesSection';
import { FleetSection } from '../../components/public/FleetSection';
import { IndustriesSection } from '../../components/public/IndustriesSection';
import { HowWeWorkSection } from '../../components/public/HowWeWorkSection';
import { SafetySection } from '../../components/public/SafetySection';
import { PartnershipCTA } from '../../components/public/PartnershipCTA';
import { ContactSection } from '../../components/public/ContactSection';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function HomePage() {
  useScrollReveal();

  useEffect(() => {
    document.title = 'Zawaya Alkayan | Transportation & Haulage Services in Saudi Arabia';
  }, []);

  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <FleetSection />
      <IndustriesSection />
      <HowWeWorkSection />
      <SafetySection />
      <PartnershipCTA />
      <ContactSection />
      <Footer />
    </div>
  );
}
