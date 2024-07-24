import { defineConfig } from "tsup";
export default defineConfig([
  {
    entry: [
      "src/**/*.ts",
      "src/**/*.tsx",
      "!src/**/*.stories.tsx",
      "!src/**/*.stories.ts",
      "src/**/*.css",
    ],
    format: ["cjs", "esm"],
    target: ["es2020"],
    outDir: "build",
    dts: true,
    sourcemap: true,
    clean: true,
    bundle: false,
  },
]);
