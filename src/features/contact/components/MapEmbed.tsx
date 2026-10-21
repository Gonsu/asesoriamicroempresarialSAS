import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useConsent } from "@/features/consent/useConsent";
import { site } from "@/config/site";
import mapPlaceholder from "@/assets/map-placeholder.svg";

const { latitude, longitude } = site.address.geo;
const EMBED_URL = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&hl=es&output=embed`;

/**
 * Mapa de Google con carga al hacer clic: hasta entonces solo se muestra una imagen local,
 * así que el visitante no se conecta a Google (ni recibe sus cookies) si no quiere ver el mapa.
 * Además exige el consentimiento de "Mapas"; si no lo hay, lo pide antes de cargar.
 */
const MapEmbed = () => {
  const { maps, allow } = useConsent();
  const [loaded, setLoaded] = useState(false);
  const [asking, setAsking] = useState(false);

  const showMap = () => (maps ? setLoaded(true) : setAsking(true));
  const acceptAndShow = () => {
    allow("maps");
    setLoaded(true);
  };

  if (loaded && maps) {
    return (
      <iframe
        src={EMBED_URL}
        title={`Mapa: ${site.address.street}, ${site.address.city}`}
        className="w-full h-64 rounded-lg border border-border"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        allowFullScreen
      />
    );
  }

  return (
    <div className="relative h-64 rounded-lg border border-border overflow-hidden">
      <img src={mapPlaceholder} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative h-full flex flex-col items-center justify-center gap-3 bg-background/40 px-4 text-center">
        <MapPin className="w-8 h-8 text-primary" aria-hidden="true" />
        {asking ? (
          <div role="group" aria-label="Permiso para cargar Google Maps" className="bg-card/95 rounded-lg p-4 max-w-sm shadow-md space-y-3">
            <p className="text-xs text-foreground">
              Para ver el mapa necesitamos tu permiso: Google Maps recibe tu IP y puede usar sus propias cookies. Más
              información en la{" "}
              <Link to="/politica-de-datos" className="underline hover:text-primary">
                Política de tratamiento de datos
              </Link>
              .
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="px-4 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted transition-colors"
              >
                Ahora no
              </button>
              <button
                type="button"
                onClick={acceptAndShow}
                className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Aceptar y ver mapa
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={showMap}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Ver mapa
          </button>
        )}
        <p className="text-xs text-foreground/80 max-w-xs">
          Al ver el mapa se cargará contenido de Google Maps.{" "}
          <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            Abrir en Google Maps
          </a>
        </p>
      </div>
    </div>
  );
};

export default MapEmbed;
