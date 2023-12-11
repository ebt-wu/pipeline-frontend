import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    'pipeline-backend': {
      loader: './custom-loader.ts',
    },
  },
  documents: 'projects/ui/src/**/queries.ts',
  generates: {
    'projects/ui/src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
  },
}

export default config
