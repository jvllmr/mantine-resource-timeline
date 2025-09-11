import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";
import path from "node:path";
const excludeFileNames: string[] = ["gestureControls", "selectControls"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  source: {
    tsconfigPath: "./tsconfig.lib.json",
  },
  lib: [
    {
      format: "esm",
      syntax: "es2020",
      bundle: false,
      dts: {
        bundle: false,
        distPath: "./dist/types",
        build: true,
      },
      output: {
        filename: {
          js: "[name].mjs",
        },
        distPath: {
          root: "./dist/es",
        },
        cleanDistPath: true,
      },
    },
    {
      format: "cjs",
      syntax: "es2020",
      bundle: false,
      dts: {
        bundle: false,
        //distPath: "./dist/types",
        //build: true,
      },
      output: {
        cleanDistPath: true,
        filename: {
          js: "[name].cjs",
        },
        distPath: {
          root: "./dist/lib",
        },
      },
    },
  ],
  output: {
    minify: false,
    sourceMap: true,
    target: "web",
  },
  plugins: [
    pluginReact(),
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      babelLoaderOptions(opts) {
        //opts.plugins?.unshift([
        //  "babel-plugin-react-compiler",
        //  ReactCompilerConfig,
        //]);
      },
    }),
  ],
  resolve: {
    alias: {
      "mantine-resource-timeline": path.resolve(__dirname, "/src"),
    },
  },
});
