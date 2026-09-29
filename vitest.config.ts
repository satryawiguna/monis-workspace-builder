import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests (07 - Test Strategy §2, DL-002): Node environment, no DOM.
// Components are only rendered to static HTML with react-dom/server.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
