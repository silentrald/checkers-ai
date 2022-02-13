const ERROR = 2;

module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    browser: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
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
      minItems: 3,
    } ],
    'object-property-newline': ERROR,
    'object-curly-spacing': [ ERROR, 'always' ],
    'object-curly-newline': [ 'error', {
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
  },
};
