import Seo from "@/components/Seo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, MapPin, Facebook, Instagram, Send } from "lucide-react";
import { mailtoUrl, site } from "@/config/site";
import { FieldError } from "@/components/QueryState";
import { contactMailto, contactSchema, type ContactFormValues } from "@/features/contact/schema";

const Contacto = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = (values: ContactFormValues) => {
    window.location.href = contactMailto(mailtoUrl, values);
  };

  return (
    <>
      <Seo
        title="Contacto y ubicación en Barrio Lleras, Cúcuta | AME S.A.S."
        description={`Contáctanos: ${site.address.street}, ${site.address.neighborhood}, ${site.address.city}. WhatsApp +57 ${site.phone.display} y correo ${site.email}.`}
        path="/contacto"
      />
      <section className="bg-ame-dark py-16 px-6 md:px-8 text-center">
        <span className="text-sm font-semibold text-primary">Contáctenos</span>
        <h1 className="text-4xl md:text-5xl font-semibold text-primary-foreground mt-3 mb-4">
          Hablemos de tu proyecto
        </h1>
        <p className="text-primary-foreground/70 max-w-2xl mx-auto text-base">
          Estamos listos para asesorarte. Escríbenos por el medio que prefieras.
        </p>
      </section>

      <section className="section-padding px-6 md:px-8 bg-background">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Info */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Información de contacto</h2>
            <div className="space-y-4">
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/40 transition-colors group"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">WhatsApp / Teléfono</div>
                  <div className="text-sm text-muted-foreground">{site.phone.display}</div>
                </div>
              </a>

              <a
                href={mailtoUrl}
                className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Correo electrónico</div>
                  <div className="text-sm text-muted-foreground">{site.email}</div>
                </div>
              </a>

              <a
                href={site.address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Dirección</div>
                  <div className="text-sm text-muted-foreground">
                    {site.address.street}, {site.address.neighborhood}<br />{site.address.city}, {site.address.region}
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-foreground mb-3">Síguenos</div>
              <div className="flex gap-3">
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram size={18} />
                </a>
              </div>
            </div>

            <a
              href={site.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-border bg-primary/5 hover:bg-primary/10 transition-colors px-4 py-6 text-sm font-medium text-primary"
            >
              <MapPin size={18} /> Ver ubicación en Google Maps
            </a>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Envíanos un mensaje</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 bg-card p-6 rounded-lg border border-border">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby="name-error"
                  {...register("name")}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <FieldError id="name-error" message={errors.name?.message} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Correo</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                  {...register("email")}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <FieldError id="email-error" message={errors.email?.message} />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">Mensaje</label>
                <textarea
                  id="message"
                  rows={5}
                  aria-invalid={!!errors.message}
                  aria-describedby="message-error"
                  {...register("message")}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <FieldError id="message-error" message={errors.message?.message} />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Send size={16} /> Enviar mensaje
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Se abrirá tu cliente de correo con el mensaje listo para enviar.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contacto;
