import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core'
import { PolicyService } from '../../services/policy.service'
import { SecretService } from '../../services/secret.service'

@Component({
  selector: 'app-base-service-details',
  template: '',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseServiceDetailsComponent implements OnInit {
  canUserEditCredentials = signal(false)
  pendingShowInVault = signal(false)
  errorMessage = signal('')

  constructor(
    protected policyService: PolicyService,
    protected secretService: SecretService,
  ) {}

  async ngOnInit() {
    this.canUserEditCredentials.set(await this.policyService.canUserEditCredentials())
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    try {
      window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank', 'noopener, noreferrer')
    } catch (error) {
      const errorMessage = (error as Error).message
      if (errorMessage) {
        this.errorMessage.set(errorMessage)
      } else {
        this.errorMessage.set('Unknown error')
      }
    }
    this.pendingShowInVault.set(false)
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }
}
