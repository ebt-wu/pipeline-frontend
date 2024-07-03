const { defaultTransformerOptions } = require('jest-preset-angular/presets')

globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json',
}

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: 'ui',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
    '@enums': '<rootDir>/src/app/enums.ts',
    '@types': '<rootDir>/src/app/types.ts',
    '@constants': '<rootDir>/src/app/constants.ts',
    '@generated/graphql': '<rootDir>/src/generated/graphql.ts',
  },

  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        ...defaultTransformerOptions,
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/?!@angular'],
}
