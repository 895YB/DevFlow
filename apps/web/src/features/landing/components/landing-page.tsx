import { LandingNavbar } from './landing-navbar';
import { HeroSection } from './hero-section';
import { FeaturesSection } from './features-section';
import { ProductShowcase } from './product-showcase';
import { TestimonialsSection } from './testimonials-section';
import { FaqSection } from './faq-section';
import { ContactSection } from './contact-section';
import { LandingFooter } from './landing-footer';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <LandingNavbar />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <ProductShowcase />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
