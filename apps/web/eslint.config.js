import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    rules: {
      // Vite's built-in import.meta.env flags aren't Turbo env vars
      'turbo/no-undeclared-env-vars': [
        'warn',
        { allowList: ['^DEV$', '^PROD$', '^MODE$', '^SSR$', '^BASE_URL$'] },
      ],
    },
  },
];
