import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

type FeatureFlags = Record<FlagKeys, boolean | string[]>
export const Flags = {
  CX_ONE_INSTALLATION_ENABLED: 'CX_ONE_INSTALLATION_ENABLED',
  GHAS_ON_ACTIONS_ENABLED: 'GHAS_ON_ACTIONS_ENABLED',
} as const

const TEST_TENANT_ID = '01ezesr3cgghmhgpbny04hv8qn'

export type FlagKeys = (typeof Flags)[keyof typeof Flags]

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  constructor(private readonly luigiService: DxpLuigiContextService) {}

  async isCxOneInstallationEnabled() {
    const context = await this.luigiService.getContextAsync()
    return (await this.getFlagValue(Flags.CX_ONE_INSTALLATION_ENABLED, context.projectId)) || this.isTestTenant()
  }

  async isGhasOnActionsEnabled() {
    const context = await this.luigiService.getContextAsync()
    return (await this.getFlagValue(Flags.GHAS_ON_ACTIONS_ENABLED, context.projectId)) || this.isTestTenant()
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
