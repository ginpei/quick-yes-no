module.exports = {
  extends: [
    'eslint-config-airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // leave it to tsc
    '@typescript-eslint/no-use-before-define': 'off',
    'arrow-parens': ['error', 'always'],
    'class-methods-use-this': 'off',
    'import/extensions': ['error', 'never'],
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
  },
};
