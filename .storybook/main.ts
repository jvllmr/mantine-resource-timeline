import { StorybookConfig } from "storybook-react-rsbuild";
const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "storybook-dark-mode",

    "@storybook/addon-themes",
    "@storybook/addon-interactions",
    "storybook-addon-rslib",
  ],
  framework: {
    name: "storybook-react-rsbuild",
    options: {},
  },
  rsbuildFinal: (config) => {
    config.output ||= {};
    config.output.assetPrefix = "/mantine-resource-timeline/";
    return config;
  },
};
export default config;
