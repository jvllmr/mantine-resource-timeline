import type { StorybookConfig } from "@storybook/react-vite";

import path from "path";
const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "storybook-dark-mode",

    {
      name: "@storybook/addon-storysource",
      options: {
        rule: {
          // test: [/\.stories\.jsx?$/], This is default
          include: [path.resolve(__dirname, "../src")], // You can specify directories
        },
        loaderOptions: {
          prettierConfig: { singleQuote: false },
          injectStoryParameters: false,
        },
      },
    },
    {
      name: "@storybook/addon-docs",
      options: {
        csfPluginOptions: null,
        mdxPluginOptions: {},
        sourceLoaderOptions: {
          injectStoryParameters: false,
        },
      },
    },
    {
      name: "@storybook/addon-essentials",
      options: { docs: false, backgrounds: false },
    },
    "@storybook/addon-themes",
    "@storybook/addon-interactions",
    "storybook-addon-rslib",
  ],
  framework: {
    name: "storybook-react-rsbuild",
    options: {},
  },
};
export default config;
