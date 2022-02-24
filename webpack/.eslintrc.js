const ERROR = 2;

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [ 'eslint:recommended', 'plugin:@typescript-eslint/recommended' ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [ '@typescript-eslint' ],
  rules: {
    'max-len': [ ERROR, {
      code: 100,
    } ],
    indent: [ ERROR, 2 ],
    quotes: [ ERROR, 'single' ],
    semi: [ ERROR, 'always' ],
    'array-bracket-spacing': [ ERROR, 'always' ],
    'array-bracket-newline': [ ERROR, {
      minItems: 3,
    } ],
    'array-element-newline': [ ERROR, {
      ArrayExpression: 'consistent',
      ArrayPattern: {
        minItems: 3,
      },
    } ],
    'object-property-newline': ERROR,
    'object-curly-spacing': [ ERROR, 'always' ],
    'object-curly-newline': [ ERROR, {
      ObjectExpression: {
        multiline: true,
        minProperties: 1,
      },
      ObjectPattern: {
        multiline: true,
        minProperties: 3,
      },
      ImportDeclaration: {
        multiline: true,
        minProperties: 3,
      },
      ExportDeclaration: 'always',
    } ],
    'operator-linebreak': [ ERROR, 'after' ],
    'no-trailing-spaces': ERROR,
    'comma-dangle': [ ERROR, {
      arrays: 'never',
      objects: 'always',
      imports: 'never',
      exports: 'never',
      functions: 'never',
    } ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
