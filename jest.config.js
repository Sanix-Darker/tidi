/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/__mocks__/setupTests.js'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'      // let Babel transpile JSX/ESNext
  },
  moduleNameMapper: {                   // stub style-sheet imports
    '\\.(css|less|s[ac]ss)$': 'identity-obj-proxy'
  }
};
