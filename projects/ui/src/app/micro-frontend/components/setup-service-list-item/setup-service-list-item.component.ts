import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import {
  BusyIndicatorModule,
  ButtonModule,
  InfoLabelModule,
  ListModule,
  ObjectStatusModule,
} from '@fundamental-ngx/core'
import { Categories } from '@enums'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { NgIf } from '@angular/common'

/**
 * This is a dumb component to be displayed on the list of services that can be set up indivitually
 * before there is a resource for the service.
 */
@Component({
  selector: 'app-setup-service-list-item',
  templateUrl: './setup-service-list-item.component.html',
  styleUrls: ['./setup-service-list-item.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthorizationModule,
    BusyIndicatorModule,
    ListModule,
    ButtonModule,
    NgIf,
    ObjectStatusModule,
    InfoLabelModule,
  ],
})
export class SetupServiceListItemComponent {
  @Input() serviceName: string
  @Input() setupDialogType?: Categories
  @Input() labelText?: string

  constructor(private readonly luigiClient: LuigiClient) {}

  openDialog(e: Event, dialogToOpen: Categories) {
    e.stopPropagation()
    switch (dialogToOpen) {
      case Categories.STATIC_SECURITY_CHECKS:
        this.luigiClient
          .linkManager()
          .fromVirtualTreeRoot()
          .openAsModal('setup-validation', { title: 'Add Static Security Checks', width: '420px', height: '670px' })
        break
    }
  }
}
