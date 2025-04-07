import { Kinds, StepKey } from '@enums'
import { isBuildPipelineSetup } from './pipeline-utils'

describe('PipelineUtils', () => {
  describe('isBuildPipelineSetup', () => {
    /**
     * Required resources:
     * - Orchestrator (Jenkins, Github Actions, Azure DevOps)
     */

    it('should return true if build pipeline is set up with Jenkins as orchestrator', () => {
      const resourceRefs = [
        { kind: Kinds.GITHUB_REPOSITORY },
        { kind: Kinds.JENKINS_PIPELINE },
        { kind: Kinds.PIPER_CONFIG },
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
      ]
      expect(isBuildPipelineSetup(resourceRefs)).toBe(true)
    })

    it('should return true if build pipeline is set up with GitHub Actions as orchestrator', () => {
      const resourceRefs = [
        { kind: Kinds.GITHUB_REPOSITORY },
        { kind: Kinds.GITHUB_ACTIONS_PIPELINE },
        { kind: Kinds.PIPER_CONFIG },
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
      ]
      expect(isBuildPipelineSetup(resourceRefs)).toBe(true)
    })

    it('should return true if build pipeline is set up with Azure as orchestrator', () => {
      const resourceRefs = [
        { kind: Kinds.GITHUB_REPOSITORY },
        { kind: StepKey.AZURE_DEV_OPS },
        { kind: Kinds.PIPER_CONFIG },
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
      ]
      expect(isBuildPipelineSetup(resourceRefs)).toBe(true)
    })

    it('should return false if there is no orchestrator, regardless of validation tools that are set up', () => {
      const resourceRefs = [
        { kind: Kinds.GITHUB_REPOSITORY },
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
        { kind: Kinds.GITHUB_ADVANCED_SECURITY },
        { kind: Kinds.SONAR_QUBE_PROJECT },
        { kind: Kinds.OPEN_SOURCE_COMPLIANCE },
        { kind: Kinds.CX_ONE_PROJECT },
      ]
      expect(isBuildPipelineSetup(resourceRefs)).toBe(false)
    })

    it('should return true for an xmake build', () => {
      const resourceRefs = [
        { kind: Kinds.GITHUB_REPOSITORY },
        { kind: StepKey.XMAKE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.JENKINS_PIPELINE },
      ]
      expect(isBuildPipelineSetup(resourceRefs)).toBe(true)
    })
  })
})
