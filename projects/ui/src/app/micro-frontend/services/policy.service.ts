import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

@Injectable({ providedIn: 'root' })
export class PolicyService {
  constructor(private readonly luigiService: DxpLuigiContextService) {}

  async getUserPolicies(): Promise<string[]> {
    const context = await this.luigiService.getContextAsync()
    return context.entityContext.project.policies
  }

  async canUserEditCredentials(): Promise<boolean> {
    const userPolicies = await this.getUserPolicies()
    return userPolicies.includes('vault_maintainer') || userPolicies.includes('owner')
  }

  async isUserStaffed(): Promise<boolean> {
    const userPolicies = await this.getUserPolicies()
    return (
      userPolicies.includes('member') || userPolicies.includes('vault_maintainer') || userPolicies.includes('owner')
    )
  }

  async getCantAddCredentialsErrorMessage(): Promise<string> {
    const context = await this.luigiService.getContextAsync()
    return `
      You can’t add new credentials due to missing permissions.<br/>
      You need to be „Vault Maintainer“ to maintain credentials.
      <a href="${context.frameBaseUrl}/projects/${context.projectId}/members" target="_blank" rel="noopener noreferrer">
        Contact a project owner
      </a>`
  }

  async getPiperLibCredentialsMessage(): Promise<string> {
    return `
      Please ensure that the library "piper-lib" has valid username/password credentials
      for github.wdf.sap.corp in your Jenkins settings.
      <a href="https://github.wdf.sap.corp/pages/ContinuousDelivery/piper-doc/lib/setupLibrary/#set-up" target="_blank" rel="noopener noreferrer">
      Learn more
      </a>
      `
  }
}
