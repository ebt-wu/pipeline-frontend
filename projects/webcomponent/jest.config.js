const { defaultTransformerOptions } = require('jest-preset-angular/presets')

globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json',
}

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: 'pipeline-ui',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
  },
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        ...defaultTransformerOptions,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/?!@angular'],
}
