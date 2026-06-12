import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@layouts": path.resolve(__dirname, "src/layouts"),
      "@features": path.resolve(__dirname, "src/features"),
      "@constants": path.resolve(__dirname, "src/shared/constants"),
      "@components": path.resolve(__dirname, "src/shared/components"),
      "@types": path.resolve(__dirname, "src/shared/types"),
      "@themes": path.resolve(__dirname, "src/shared/themes"),
      "@services": path.resolve(__dirname, "src/services"),
      "@helpers": path.resolve(__dirname, "src/shared/helpers"),
      "@hooks": path.resolve(__dirname, "src/shared/hooks"),
    },
  },
  plugins: [react(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    // optional: set a fixed port if you want (defaults to 5173)
    // port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8093",
      },
    },
  },
});
