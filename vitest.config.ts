import { defineConfig } from "vitest/config";

// Unit tests for the pure lib/ modules only (07 - Test Strategy §2, DL-002):
// Node environment, no DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
