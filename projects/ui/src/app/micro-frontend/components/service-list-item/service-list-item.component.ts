import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FundamentalNgxCoreModule, IconModule } from '@fundamental-ngx/core'
import { CommonModule } from '@angular/common'
import { DebugModeService } from '../../services/debug-mode.service'
import { KindCategory, KindName } from '../../../constants'
import { Pipeline, ResourceRef } from '../../../types'
import { firstValueFrom } from 'rxjs'
import { Kinds, ServiceStatus } from '../../../enums'
import { RouterModule } from '@angular/router'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

export interface ServiceData {
  name: string
  kind: Kinds
  status: string
  pipeline?: Pipeline
}

@Component({
  selector: 'app-service-list-item',
  templateUrl: './service-list-item.component.html',
  styleUrls: ['./service-list-item.component.css'],
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule, RouterModule, IconModule, AuthorizationModule],
})
export class ServiceListItemComponent {
  @Input() resourceRef: ResourceRef // Change the type to match your data structure
  @Input() activeTile: string
  @Input() localLayout: string
  @Input() inProgressMsg: string

  kindName = KindName
  kindCategory = KindCategory
  @Output() openDetailsEvent = new EventEmitter<ServiceData>()

  constructor(readonly debugModeService: DebugModeService) {}

  openDetails(kind: Kinds, name: string, status: string) {
    this.openDetailsEvent.emit({ kind, name, status })
  }

  async retryService(e: Event, resourceRef: ResourceRef) {
    e?.stopPropagation()
    await firstValueFrom(this.debugModeService.forceDebugReconciliation(resourceRef.kind, resourceRef.name))
  }

  protected readonly ServiceStatus = ServiceStatus
}
