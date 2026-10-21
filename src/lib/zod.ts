import { z } from "zod";

// Sin compilación JIT: zod 4 intenta crear funciones con `new Function`, algo que la
// Content-Security-Policy bloquea (y reporta) porque no permite 'unsafe-eval'.
z.config({ jitless: true });

export { z };
