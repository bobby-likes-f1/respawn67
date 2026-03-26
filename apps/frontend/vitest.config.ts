import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    pool: "vmThreads",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "app/lib/**/*.ts",
        "app/components/**/*.tsx",
        "app/root.tsx",
        "app/routes/**/*.tsx",
      ],
      exclude: [
        "app/components/ui/**",
        "app/**/+types/**",
      ],
    },
    clearMocks: true,
    restoreMocks: true,
  },
});
