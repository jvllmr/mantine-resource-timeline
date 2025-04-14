import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";
export default defineConfig({
  lib: [
    {
      format: "esm",
      syntax: "es2020",
      bundle: false,
      dts: true,
    },
    {
      format: "cjs",
      syntax: "es2020",
      bundle: false,
      dts: true,
    },
  ],
  output: {
    distPath: {
      root: "build",
    },
    minify: false,
    sourceMap: true,
    target: "web",
  },
  plugins: [pluginReact()],

  // source: { entry: { index: "src/index.ts" }, exclude: "stories/**/*.tsx" },
});
