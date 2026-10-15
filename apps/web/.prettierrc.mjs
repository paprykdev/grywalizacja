import config from '@repo/eslint-config/prettier-base';

/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
export default {
  ...config,
  plugins: ['prettier-plugin-tailwindcss'],
  // Lets the plugin sort classes using our theme (Tailwind v4)
  tailwindStylesheet: './src/index.css',
  tailwindFunctions: ['cn', 'cva'],
};
