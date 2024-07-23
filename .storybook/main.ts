import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-dark-mode",
    "storybook-addon-mantine",
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
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;
