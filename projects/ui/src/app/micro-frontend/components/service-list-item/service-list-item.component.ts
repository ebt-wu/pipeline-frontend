import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  signal,
} from '@angular/core'
import { FundamentalNgxCoreModule, IconModule } from '@fundamental-ngx/core'
import { CommonModule } from '@angular/common'
import { DebugModeService } from '../../services/debug-mode.service'
import { KindCategory, KindName } from '../../../constants'
import { Pipeline, ResourceRef } from '../../../types'
import { firstValueFrom } from 'rxjs'
import { Kinds, ServiceStatus } from '../../../enums'
import { RouterModule } from '@angular/router'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { OpenSourceComplianceService } from '../../services/open-source-compliance.service'
import { ErrorMessageComponent } from '../error-message/error-message.component'

export interface ServiceData {
  name: string
  kind: Kinds
  status: string
  pipeline?: Pipeline
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-service-list-item',
  templateUrl: './service-list-item.component.html',
  styleUrl: './service-list-item.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    RouterModule,
    IconModule,
    AuthorizationModule,
    ErrorMessageComponent,
  ],
})
export class ServiceListItemComponent implements OnInit {
  @Input() resourceRef: ResourceRef // Change the type to match your data structure
  @Input() activeTile: string
  @Input() localLayout: string
  @Input() inProgressMsg: string

  kindName = KindName
  kindCategory = KindCategory
  serviceStatus = ServiceStatus
  errorMessage = signal('')
  @Output() readonly openDetailsEvent = new EventEmitter<ServiceData>()

  isCompliant: boolean = true

  constructor(
    readonly debugModeService: DebugModeService,
    readonly luigiClient: LuigiClient,
    private readonly openSourceComplianceService: OpenSourceComplianceService,
    private cd: ChangeDetectorRef,
  ) {}

  openDetails(kind: Kinds, name: string, status: string) {
    this.openDetailsEvent.emit({ kind, name, status })
  }

  ngOnInit(): void {
    if (this.isOSCItem()) {
      this.fetchIsOpenSourceCompliant()
    }
  }

  isOSCItem() {
    return this.resourceRef.kind === Kinds.OPEN_SOURCE_COMPLIANCE
  }

  async retryService(e: Event, resourceRef: ResourceRef) {
    e?.stopPropagation()
    await firstValueFrom(this.debugModeService.forceDebugReconciliation(resourceRef.kind, resourceRef.name))
  }

  fetchIsOpenSourceCompliant() {
    firstValueFrom(this.openSourceComplianceService.getOpenSourceComplianceRegistration())
      .then((details) => {
        this.isCompliant = details.ppmsScv !== ''
        this.cd.detectChanges()
      })
      .catch((error) => {
        const errorMessage = (error as Error).message
        if (errorMessage) {
          this.errorMessage.set(errorMessage)
        } else {
          this.errorMessage.set('Unknown error')
        }
      })
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }
}
