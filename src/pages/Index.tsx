import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import About from "@/components/About";
import Meetings from "@/components/Meetings";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="max-w-[1100px] mx-auto bg-card rounded-lg overflow-hidden border border-border">
    <TopBar />
    <Header />
    <Hero />
    <Services />
    <WhyUs />
    <About />
    <Meetings />
    <CTA />
    <Footer />
  </div>
);

export default Index;
