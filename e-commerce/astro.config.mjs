// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "server", // ⬅️ INI YANG KURANG

  vite: {
    plugins: [tailwindcss()],
  },
});
