import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

@Injectable({ providedIn: 'root' })
export class PolicyService {
  constructor(private readonly luigiService: DxpLuigiContextService) {}

  async getUserPolicies(): Promise<string[]> {
    const context = await this.luigiService.getContextAsync()
    return context.entityContext.project.policies
  }

  async isUserVaultMaintainer(): Promise<boolean> {
    const userPolicies = await this.getUserPolicies()
    return userPolicies.includes('owner') || userPolicies.includes('vault_maintainer')
  }
}
