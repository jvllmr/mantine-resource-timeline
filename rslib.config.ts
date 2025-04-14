import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

const excludeFileNames: string[] = ["gestureControls", "selectControls"];

const ReactCompilerConfig = {
  sources: (filename: string): boolean => {
    for (const testName of excludeFileNames) {
      if (filename.indexOf(testName) !== -1) {
        return false;
      }
    }
    return true;
  },
};

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
  plugins: [
    pluginReact(),
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      babelLoaderOptions(opts) {
        opts.plugins?.unshift([
          "babel-plugin-react-compiler",
          ReactCompilerConfig,
        ]);
      },
    }),
  ],

  // source: { entry: { index: "src/index.ts" }, exclude: "stories/**/*.tsx" },
});
