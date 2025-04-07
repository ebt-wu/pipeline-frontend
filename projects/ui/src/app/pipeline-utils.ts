import { KindCategory } from '@constants'
import { Categories, ServiceStatus } from '@enums'
import { ResourceRef } from '@types'

/**
 * Helper functions to determine the status of the build pipeline setup
 */

export function isBuildPipelineSetup(resourceRefs: ResourceRef[]): boolean {
  const presentCategories = resourceRefs.map((ref) => KindCategory[ref.kind])
  return presentCategories.includes(Categories.ORCHESTRATION)
}

export function areResourcesCompletelyCreated(resourceRefs: ResourceRef[]): boolean {
  return resourceRefs.every((ref) => ref.status === ServiceStatus.CREATED || ref.status === ServiceStatus.NOT_MANAGED)
}

export function isBuildPipelineSetupAndCreated(resourceRefs: ResourceRef[]): boolean {
  return isBuildPipelineSetup(resourceRefs) && areResourcesCompletelyCreated(resourceRefs)
}
