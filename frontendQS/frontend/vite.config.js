import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer"; // Opcional, para compatibilidad
import tailwindcss from "tailwindcss"; // Añadimos Tailwind CSS
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "/src": "/src", // Esto ayuda a resolver rutas absolutas como /src/index.css
      "@": "/src",
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()], // Configuramos PostCSS para Tailwind
    },
  },
});
