import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  plugins: [react(), svgr()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
