import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['src/app/ui/zard/**/*', 'src/app/core/**/*'],
  },
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'warn',
        {
          type: 'attribute',
          prefix: ['app', 'z'],
          style: 'camelCase',
        },
      ],

      '@angular-eslint/component-selector': [
        'warn',
        {
          type: 'element',
          prefix: ['app', 'z'],
          style: 'kebab-case',
        },
      ],
    },
  },

  {
    files: ['**/*.html'],
    rules: {},
  },
];
