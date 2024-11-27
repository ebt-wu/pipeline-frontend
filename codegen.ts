import type { CodegenConfig } from '@graphql-codegen/cli'
import customLoader from './custom-loader'

const config: CodegenConfig = {
  overwrite: true,
  // @ts-expect-error: This is a custom loader
  schema: {
    'pipeline-backend': {
      loader: customLoader,
    },
  },
  documents: 'projects/ui/src/**/queries.ts',
  generates: {
    'projects/ui/src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write ./projects/ui/src/generated'],
  },
}

export default config
