import { useState } from "react";
import { MapPin } from "lucide-react";
import { site } from "@/config/site";
import mapPlaceholder from "@/assets/map-placeholder.svg";

const { latitude, longitude } = site.address.geo;
const EMBED_URL = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&hl=es&output=embed`;

/**
 * Mapa de Google con carga al hacer clic: hasta entonces solo se muestra una imagen local,
 * así que el visitante no se conecta a Google (ni recibe sus cookies) si no quiere ver el mapa.
 */
const MapEmbed = () => {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
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
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Ver mapa
        </button>
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
