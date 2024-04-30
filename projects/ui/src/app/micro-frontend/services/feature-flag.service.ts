import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

type FeatureFlags = {
  [key in FlagKeys]: boolean | string[]
}
export const Flags = {
  GITHUB_ACTIONS_ENABLED: 'GITHUB_ACTIONS_ENABLED',
  GHAS_ENABLED: 'GHAS_ENABLED',
} as const

export type FlagKeys = (typeof Flags)[keyof typeof Flags]

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  constructor(private readonly luigiService: DxpLuigiContextService) {}

  async isGithubActionsEnabled(projectId: string) {
    return await this.getFlagValue(Flags.GITHUB_ACTIONS_ENABLED, projectId)
  }

  async isGhasEnabled(projectId: string) {
    return await this.getFlagValue(Flags.GHAS_ENABLED, projectId)
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
