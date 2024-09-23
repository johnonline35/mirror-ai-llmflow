module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: "current" },
        modules: "commonjs", // Ensure Babel converts ESM to CommonJS
      },
    ],
    "@babel/preset-typescript",
  ],
};
