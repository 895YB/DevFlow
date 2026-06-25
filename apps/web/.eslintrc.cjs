module.exports = {
  root: true,
  extends: ['@devflow/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.app.json',
    tsconfigRootDir: __dirname,
  },
};
