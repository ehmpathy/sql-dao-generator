module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts', '!**/*.integration.test.ts'],
  testEnvironment: 'node',
  setupFiles: ['core-js'], // .flat() undefined otherwise; https://stackoverflow.com/a/59285424/3068233
  verbose: true,
};
