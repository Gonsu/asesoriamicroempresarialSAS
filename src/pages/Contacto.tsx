import { useState } from "react";
import { Phone, Mail, MapPin, Facebook, Instagram, Send } from "lucide-react";

const Contacto = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contacto desde la web — ${form.name}`);
    const body = encodeURIComponent(
      `Nombre: ${form.name}\nCorreo: ${form.email}\n\nMensaje:\n${form.message}`
    );
    window.location.href = `mailto:asesoriamsas@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
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
                href="https://wa.me/573168308779"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/40 transition-colors group"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">WhatsApp / Teléfono</div>
                  <div className="text-sm text-muted-foreground">316 830 8779</div>
                </div>
              </a>

              <a
                href="mailto:asesoriamsas@gmail.com"
                className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Correo electrónico</div>
                  <div className="text-sm text-muted-foreground">asesoriamsas@gmail.com</div>
                </div>
              </a>

              <a
                href="https://maps.app.goo.gl/K4ZsyQxgMnRXskWL8"
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
                    Cll. 5 No. OA-114 2° Piso, Barrio Lleras<br />Cúcuta, Norte de Santander
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-foreground mb-3">Síguenos</div>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=100090527183922"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://www.instagram.com/asesoriamsas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram size={18} />
                </a>
              </div>
            </div>

            <div className="mt-6 rounded-lg overflow-hidden border border-border h-64">
              <iframe
                title="Ubicación AME S.A.S."
                src="https://www.google.com/maps?q=Calle+5+Barrio+Lleras+Cucuta+Norte+de+Santander&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Envíanos un mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Correo</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">Mensaje</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
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
