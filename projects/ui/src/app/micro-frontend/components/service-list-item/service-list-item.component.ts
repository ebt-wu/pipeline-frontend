import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core'
import { FundamentalNgxCoreModule, IconModule } from '@fundamental-ngx/core'
import { CommonModule } from '@angular/common'
import { DebugModeService } from '../../services/debug-mode.service'
import { KindCategory, KindName } from '../../../constants'
import { Pipeline, ResourceRef } from '../../../types'
import { firstValueFrom, map } from 'rxjs'
import { Kinds, ServiceStatus, StepKey } from '../../../enums'
import { RouterModule } from '@angular/router'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { OpenSourceComplianceService } from '../../services/open-source-compliance.service'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { ApolloError } from '@apollo/client/core'

export interface ServiceData {
  name: string
  kind: Kinds | StepKey
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

  openDetails(kind: Kinds | StepKey, name: string, status: string) {
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

  async retryService(e: Event, resourceRef: ResourceRef): Promise<void> {
    e?.stopPropagation()
    try {
      await firstValueFrom(this.debugModeService.forceDebugReconciliation(resourceRef.kind, resourceRef.name))
    } catch (e) {
      if (e instanceof ApolloError) {
        this.debugModeService.messageToastService.open(e.message, {
          duration: 5000,
        })
      }
    }
  }

  async toggleDebugLabel(e: Event, resourceRef: ResourceRef): Promise<void> {
    e?.stopPropagation()
    try {
      if (!isKind(resourceRef.kind)) {
        return void 0 // We don't want to toggle debug label for StepKey
      }
      await firstValueFrom(
        this.debugModeService.toggleDebugLabel(resourceRef.kind, resourceRef.name).pipe(
          map((result) => {
            if (result.data?.toggleDebugLabel) {
              this.debugModeService.messageToastService.open(result.data?.toggleDebugLabel, {
                duration: 5000,
              })
            }
            return void 0
          }),
        ),
      )
    } catch (error) {
      if (error instanceof ApolloError) {
        this.debugModeService.messageToastService.open(error.message, {
          duration: 5000,
        })
      }
      return void 0
    }
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

function isKind(value: Kinds | StepKey): value is Kinds {
  return Object.values(Kinds).includes(value as Kinds)
}
