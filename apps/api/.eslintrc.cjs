module.exports = {
  root: true,
  extends: ['@devflow/eslint-config/node'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
