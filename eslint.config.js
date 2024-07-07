import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPluginSvelte from 'eslint-plugin-svelte';

export default [
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    languageOptions: { globals: globals.browser }
  },
  pluginJs.configs.recommended,
];
