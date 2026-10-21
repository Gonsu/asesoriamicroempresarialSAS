import { useLocation } from "react-router-dom";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Seo
        title="Página no encontrada | AME S.A.S."
        description="La página solicitada no existe en el sitio de AME S.A.S."
        path={location.pathname}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          La página que buscas no existe.
        </p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
