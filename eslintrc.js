module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  plugins: ['simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn", // or "error"
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'indent': [
      'error', 2, { 'MemberExpression': 1, 'ArrayExpression': 1, 'ImportDeclaration': 1, 'offsetTernaryExpressions': false }
    ],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'semi-spacing': ['error', { before: true, after: true }],
    'no-var': ['error'],
    'no-multi-spaces': ['error'],
    'no-trailing-spaces': ['error', { ignoreComments: true }],
    'no-undef': ['error', { 'typeof': true }],
    'no-unused-expressions': ['error', { 'enforceForJSX': true }],
    'no-debugger': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxBOF': 1 }],
    'rest-spread-spacing': ['error'],
    'template-curly-spacing': ['error', 'never'],
    'no-tabs': ['error'],
    'eol-last': ['error', 'always'],
  },
}
