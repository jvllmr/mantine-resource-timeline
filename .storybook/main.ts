import { StorybookConfig } from "storybook-react-rsbuild";
const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook-community/storybook-dark-mode",
    "@storybook/addon-docs",
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
