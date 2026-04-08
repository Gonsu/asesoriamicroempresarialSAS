import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import CompanyDetails from "@/components/CompanyDetails";
import About from "@/components/About";
import Meetings from "@/components/Meetings";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import PageViewTracker from "@/components/PageViewTracker";

const Index = () => (
  <div id="main-scroll-container" className="max-w-[1100px] mx-auto bg-card rounded-lg overflow-x-hidden border border-border">
    <PageViewTracker />
    <TopBar />
    <Header />
    <Hero />
    <Services />
    <WhyUs />
    <CompanyDetails />
    <About />
    <Meetings />
    <TestimonialsSection />
    <CTA />
    <Footer />
    <FloatingWhatsApp />
  </div>
);

export default Index;
