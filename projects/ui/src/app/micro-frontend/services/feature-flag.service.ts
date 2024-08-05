import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

type FeatureFlags = {
  [key in FlagKeys]: boolean | string[]
}
export const Flags = {
  GITHUB_ACTIONS_ENABLED: 'GITHUB_ACTIONS_ENABLED',
  GHAS_ENABLED: 'GHAS_ENABLED',
  OSC_ENABLED: 'OSC_ENABLED',
} as const

const TEST_TENANT_ID = '01ezesr3cgghmhgpbny04hv8qn'

export type FlagKeys = (typeof Flags)[keyof typeof Flags]

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  constructor(private readonly luigiService: DxpLuigiContextService) {}

  async isGithubActionsEnabled(projectId: string) {
    return (await this.getFlagValue(Flags.GITHUB_ACTIONS_ENABLED, projectId)) || this.isTestTenant()
  }

  async isGhasEnabled(projectId: string) {
    return (await this.getFlagValue(Flags.GHAS_ENABLED, projectId)) || this.isTestTenant()
  }

  async isOscEnabled(projectId: string) {
    return (await this.getFlagValue(Flags.OSC_ENABLED, projectId)) || this.isTestTenant()
  }

  isTestTenant() {
    return this.luigiService.getContext().tenantid === TEST_TENANT_ID
  }

  private async getFlagValue(flag: FlagKeys, projectId: string): Promise<boolean> {
    const featureFlags = (await this.luigiService.getContext().featureFlags) as FeatureFlags

    const flagValue = featureFlags[flag] ?? false

    if (typeof flagValue === 'boolean') {
      return flagValue
    }

    return flagValue.includes(projectId)
  }
}
