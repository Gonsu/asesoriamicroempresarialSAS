import Meetings from "@/components/Meetings";
import TestimonialsSection from "@/components/TestimonialsSection";

const Reuniones = () => (
  <>
    <section className="bg-ame-dark py-16 px-6 md:px-8 text-center">
      <span className="text-sm font-semibold text-primary">Actividades</span>
      <h1 className="text-4xl md:text-5xl font-semibold text-primary-foreground mt-3 mb-4">
        Reuniones y Asesorías
      </h1>
      <p className="text-primary-foreground/70 max-w-2xl mx-auto text-base">
        Conoce nuestras últimas actividades y el trabajo con nuestros clientes.
      </p>
    </section>
    <Meetings />
    <TestimonialsSection />
  </>
);

export default Reuniones;
