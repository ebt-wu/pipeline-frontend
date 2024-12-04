import { Kinds, ServiceStatus, StepKey } from '@enums'
import { NotManagedServices, PipelineType } from '@generated/graphql'
import { Pipeline } from '@types'

export function createPipelineForTests(
  refMapping?: {
    kind: Kinds | StepKey
    status?: ServiceStatus
    error?: string
    name?: string
  }[],
  notManagedServiceData?: NotManagedServices,
): Pipeline {
  const pipeline: Pipeline = {
    name: 'my-component',
    pipelineType: PipelineType.FullPipeline,
    namespace: '',
    labels: [],
    resourceRefs: refMapping
      ? refMapping.map((ref) => ({
          kind: ref.kind,
          status: ref.status || ServiceStatus.CREATED,
          error: ref.error || '',
          name: ref.name || `${ref.kind}-my-component`,
        }))
      : [],
  }
  if (notManagedServiceData) {
    pipeline.notManagedServices = notManagedServiceData
  }

  return pipeline
}
