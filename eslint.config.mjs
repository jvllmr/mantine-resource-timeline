import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  reactRefresh.configs.vite,

  react.configs.flat.recommended,
  storybook.configs["flat/recommended"],

  {
    plugins: {
      "react-hooks": fixupPluginRules(reactHooks),
      "react-compiler": reactCompiler,
    },
    rules: react.configs.recommended.rules,
  },
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-compiler/react-compiler": "error",
    },
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2020, ...globals.commonjs },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  { ignores: ["dist/", "build/", "node_modules/"] },
);
