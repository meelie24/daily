import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Builds the whole prototype into one self-contained HTML file (fonts
 * and assets inlined) for hosted preview pages. Not used by the normal
 * dev/build/test scripts.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-artifact",
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 4000,
  },
});
