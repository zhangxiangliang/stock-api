const baseConfig = require("./jest.config");

module.exports = {
  ...baseConfig,
  testTimeout: 30000,
  testMatch: ["<rootDir>/test/integration/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
};
