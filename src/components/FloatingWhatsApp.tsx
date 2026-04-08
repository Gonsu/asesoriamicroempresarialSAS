import { useState, useEffect, useCallback } from "react";
import { MessageCircle, X } from "lucide-react";

const WA_LINK = "https://wa.me/3168308779";
const TOOLTIP_KEY = "waTooltipSeen";

const FloatingWhatsApp = () => {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleVisibility = useCallback(() => {
    if (visible) return;
    const scrollPct =
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    if (scrollPct >= 40) setVisible(true);
  }, [visible]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 8000);
    window.addEventListener("scroll", handleVisibility, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleVisibility);
    };
  }, [handleVisibility]);

  // Show tooltip once visible, only if not seen before
  useEffect(() => {
    if (!visible) return;
    const seen = localStorage.getItem(TOOLTIP_KEY);
    if (seen) return;
    setShowTooltip(true);
    const t = setTimeout(() => {
      setShowTooltip(false);
      localStorage.setItem(TOOLTIP_KEY, "true");
    }, 6000);
    return () => clearTimeout(t);
  }, [visible]);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem(TOOLTIP_KEY, "true");
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 transition-all duration-400 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
      }`}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="relative bg-card border border-border shadow-lg rounded-xl px-4 py-3 max-w-[240px] text-sm text-foreground animate-fade-in-up">
          <button
            onClick={dismissTooltip}
            className="absolute top-1 right-1 p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
          <p>¿Necesitas asesoría financiera? Escríbenos ahora 👋</p>
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
        </div>
      )}

      {/* Button */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-wa-pulse"
      >
        <MessageCircle size={28} fill="white" strokeWidth={0} />
      </a>
    </div>
  );
};

export default FloatingWhatsApp;
