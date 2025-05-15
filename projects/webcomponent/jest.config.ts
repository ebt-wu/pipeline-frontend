import type { Config } from 'jest'
import { defaultTransformerOptions } from 'jest-preset-angular/build/presets'
import { createCjsPreset } from 'jest-preset-angular/presets'

globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json',
}

const presetConfig = createCjsPreset({
  tsconfig: 'tsconfig.spec.json',
})

export default {
  ...presetConfig,
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
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/?!@angular'],
  displayName: 'wc',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
} satisfies Config
