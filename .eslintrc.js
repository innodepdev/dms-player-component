module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  plugins: ["react", "@typescript-eslint"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
  ],
  parserOptions: {
    parser: "typescript-eslint-parser",
    ecmaVersion: 2018,
    sourceType: "module",
    project: "tsconfig.json"
  },
  settings: {
    react: {
      pragma: "h",
      version: "16.3"
    }
  },
  rules: {
    "no-console": "off",
  }
};