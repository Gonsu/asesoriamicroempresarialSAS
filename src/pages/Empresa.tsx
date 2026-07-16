import About from "@/components/About";
import WhyUs from "@/components/WhyUs";
import CompanyDetails from "@/components/CompanyDetails";

const Empresa = () => (
  <>
    <section className="bg-ame-dark py-16 px-6 md:px-8 text-center">
      <span className="text-sm font-semibold text-primary">Nuestra empresa</span>
      <h1 className="text-4xl md:text-5xl font-semibold text-primary-foreground mt-3 mb-4">
        Conócenos
      </h1>
      <p className="text-primary-foreground/70 max-w-2xl mx-auto text-base">
        Una sociedad comprometida con el desarrollo microempresarial de Norte de Santander.
      </p>
    </section>

    <div id="quienes">
      <About />
    </div>
    <div id="mision">
      <WhyUs />
    </div>
    <div id="objetivos">
      <CompanyDetails />
    </div>
  </>
);

export default Empresa;
