const moduleNameMapper = {
  "^@stocks/(.*)$": "<rootDir>/src/stocks/$1",
  "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  "^types/(.*)$": "<rootDir>/src/types/$1",
};

module.exports = {
  verbose: true,
  testTimeout: 15000,
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  testMatch: ["<rootDir>/test/unit/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper,
};
