import { useContext } from "react";
import { ConsentContext } from "./consent-context";

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent debe usarse dentro de ConsentProvider");
  return context;
};
