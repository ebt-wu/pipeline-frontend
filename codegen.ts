import type { CodegenConfig } from '@graphql-codegen/cli'
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    'pipeline-backend': {
      loader: './custom-loader.ts',
    }
  },
  documents: 'src/**/queries.ts',
  generates: {
    'projects/ui/src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
  },
}
}

export default config
export default config
