import { getViteConfig } from "@react-router/dev/vite";
import { defineConfig } from "vitest/config";

export default defineConfig(
  getViteConfig({
    ssr: false,
  }),
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./test/setup.ts"],
      include: ["test/**/*.{test,spec}.{ts,tsx}"],
    },
  })
);
