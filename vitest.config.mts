import { defineConfig } from "vitest/config";

// Enhetstester för ren logik och lektionsinnehåll (ingen React, ingen AI).
// För komponenttester: lägg till @vitejs/plugin-react + jsdom enligt
// node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
