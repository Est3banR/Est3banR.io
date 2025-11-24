// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://Est3banR.io", // Cambia a la URL de tu GitHub Pages si usas por ejemplo https://usuario.github.io/repositorio
  integrations: [tailwind(), react()],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
      },
    },
  },
  output: "static", // Genera solo archivo estático para GitHub Pages
  build: {
    inlineStylesheets: "auto",
  },
});
