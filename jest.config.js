module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/config/**',
    '!__tests__/**'
  ],
  coverageDirectory: 'coverage',
  testTimeout: 30000
};