import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

type FeatureFlags = {
  [key in FlagKeys]: boolean | string[]
}
export const Flags = {
  GITHUB_ACTIONS_ENABLED: 'GITHUB_ACTIONS_ENABLED',
} as const

export type FlagKeys = (typeof Flags)[keyof typeof Flags]

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  constructor(private readonly luigiService: DxpLuigiContextService) {}

  isGithubActionsEnabled(projectId: string) {
    return this.getFlagValue(Flags.GITHUB_ACTIONS_ENABLED, projectId)
  }

  private getFlagValue(flag: FlagKeys, projectId: string): boolean {
    const featureFlags = (this.luigiService.getContext()?.featureFlags as FeatureFlags) ?? {}

    const flagValue = featureFlags?.[flag] ?? false

    if (typeof flagValue === 'boolean') {
      return flagValue
    }

    return flagValue.includes(projectId)
  }
}
