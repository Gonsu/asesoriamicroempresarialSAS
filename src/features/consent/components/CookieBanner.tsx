import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useConsent } from "../useConsent";

/**
 * Aviso de cookies y almacenamiento local. Aparece mientras no haya elección (o si cambió la
 * versión de la política) y desde "Preferencias de cookies" en el pie de página.
 * Rechazar tiene el mismo peso visual que aceptar. Es una región etiquetada (no un diálogo
 * modal) y va primero en el DOM, así que con el teclado se alcanza antes que el contenido.
 */
const CookieBanner = () => {
  const consent = useConsent();
  if (!consent.bannerOpen) return null;
  return consent.settingsOpen ? <Settings /> : <Summary />;
};

const Shell = ({ children, labelledBy }: { children: React.ReactNode; labelledBy: string }) => (
  <section
    aria-labelledby={labelledBy}
    className="fixed inset-x-0 bottom-0 z-[60] p-4 md:p-6 pointer-events-none"
  >
    <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-border bg-card shadow-2xl p-5 md:p-6">
      {children}
    </div>
  </section>
);

const PolicyLink = () => (
  <Link to="/politica-de-datos" className="text-primary underline hover:no-underline">
    Política de tratamiento de datos
  </Link>
);

const Summary = () => {
  const { acceptAll, rejectAll, openSettings } = useConsent();
  return (
    <Shell labelledBy="aviso-privacidad">
      <h2 id="aviso-privacidad" className="text-base font-semibold text-card-foreground mb-2">
        Tu privacidad
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Este sitio no usa cookies propias. Con tu permiso guardamos en tu navegador un identificador
        anónimo para contar visitantes únicos, y cargamos Google Maps en Contacto. Lo necesario para que el sitio
        funcione (tu elección, la protección anti-spam del formulario y la sesión del panel) no requiere permiso. Más
        información en la <PolicyLink />.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <Button variant="ghost" onClick={openSettings}>
          Configurar
        </Button>
        <Button variant="outline" onClick={rejectAll}>
          Rechazar
        </Button>
        <Button onClick={acceptAll}>Aceptar todo</Button>
      </div>
    </Shell>
  );
};

const Settings = () => {
  const { statistics, maps, save, consent, closeSettings } = useConsent();
  const [choices, setChoices] = useState({ statistics, maps });
  const heading = useRef<HTMLHeadingElement>(null);
  // Al abrir las preferencias el foco entra al panel (desde el pie o desde "Configurar").
  useEffect(() => heading.current?.focus(), []);
  return (
    <Shell labelledBy="preferencias-privacidad">
      <h2
        id="preferencias-privacidad"
        ref={heading}
        tabIndex={-1}
        className="text-base font-semibold text-card-foreground mb-4 focus:outline-none"
      >
        Preferencias de privacidad
      </h2>
      <ul className="space-y-4 mb-5">
        <li className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Necesarias</p>
            <p className="text-xs text-muted-foreground">
              Tu elección de privacidad, la verificación anti-spam (Cloudflare Turnstile) del formulario de contacto y la
              sesión del panel administrativo. Siempre activas.
            </p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">Siempre</span>
        </li>
        <li className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor="consent-statistics" className="text-sm font-medium">
              Estadísticas
            </Label>
            <p className="text-xs text-muted-foreground">
              Un identificador anónimo en tu navegador para contar visitantes únicos. Sin él, la visita se cuenta igual
              pero sin identificarte entre páginas.
            </p>
          </div>
          <Switch
            id="consent-statistics"
            checked={choices.statistics}
            onCheckedChange={(v) => setChoices((c) => ({ ...c, statistics: v }))}
          />
        </li>
        <li className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor="consent-maps" className="text-sm font-medium">
              Mapas
            </Label>
            <p className="text-xs text-muted-foreground">
              Cargar Google Maps en Contacto. Google recibe tu IP y puede usar sus propias cookies.
            </p>
          </div>
          <Switch
            id="consent-maps"
            checked={choices.maps}
            onCheckedChange={(v) => setChoices((c) => ({ ...c, maps: v }))}
          />
        </li>
      </ul>
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
        <p className="text-xs text-muted-foreground">
          <PolicyLink />
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={closeSettings}>
            {consent ? "Cancelar" : "Volver"}
          </Button>
          <Button onClick={() => save(choices)}>Guardar preferencias</Button>
        </div>
      </div>
    </Shell>
  );
};

export default CookieBanner;
