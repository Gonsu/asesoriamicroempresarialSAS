import Seo from "@/components/Seo";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, MapPin, Facebook, Instagram, Send, CheckCircle2 } from "lucide-react";
import { mailtoUrl, site } from "@/config/site";
import { FieldError } from "@/components/QueryState";
import { contactSchema, type ContactFormValues } from "@/features/contact/schema";
import { useSendContactMessage } from "@/features/contact/hooks";
import MapEmbed from "@/features/contact/components/MapEmbed";
import TurnstileWidget, { type TurnstileHandle } from "@/features/contact/components/TurnstileWidget";

const Contacto = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });
  const send = useSendContactMessage();
  const turnstile = useRef<TurnstileHandle>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (values: ContactFormValues) => {
    if (!token) return;
    try {
      await send.mutateAsync({ values, token });
      reset();
      setSent(true);
    } catch {
      // El mensaje de error se muestra debajo del botón (send.error).
    } finally {
      // Cada token de Turnstile sirve una sola vez.
      turnstile.current?.reset();
    }
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

            <div className="mt-6">
              <MapEmbed />
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Envíanos un mensaje</h2>
            {sent ? (
              <div role="status" className="bg-card p-6 rounded-lg border border-border text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 mx-auto text-primary" aria-hidden="true" />
                <p className="text-base font-semibold text-foreground">¡Gracias! Recibimos tu mensaje.</p>
                <p className="text-sm text-muted-foreground">Te responderemos al correo que nos dejaste.</p>
                <button type="button" onClick={() => setSent(false)} className="text-sm text-primary hover:underline">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
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
                <TurnstileWidget ref={turnstile} onToken={setToken} />
                <button
                  type="submit"
                  disabled={!token || send.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send size={16} /> {send.isPending ? "Enviando..." : "Enviar mensaje"}
                </button>
                {send.error && (
                  <p role="alert" className="text-sm text-destructive text-center">
                    {send.error.message}
                  </p>
                )}
                {!token && !send.isPending && (
                  <p className="text-xs text-muted-foreground text-center">
                    Completa la verificación anti-spam para enviar el mensaje.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contacto;
