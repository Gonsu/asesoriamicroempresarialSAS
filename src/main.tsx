import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Open Sans servida desde el propio sitio (sin Google Fonts); solo el subconjunto latino.
import "@fontsource/open-sans/latin-300.css";
import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-500.css";
import "@fontsource/open-sans/latin-600.css";
import "@fontsource/open-sans/latin-700.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
