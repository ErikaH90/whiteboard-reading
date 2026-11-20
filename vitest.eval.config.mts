import { defineConfig } from "vitest/config";

// Utvärdering av AI-bedömningen mot svarssamlingen. Anropar riktig AI – körs
// bara med `npm run eval`, aldrig i `npm test`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/eval/**/*.eval.ts"],
    testTimeout: 600_000,
    // Visa rapporten även när utvärderingen går igenom
    silent: false,
  },
});
