import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import {
  BusyIndicatorModule,
  ButtonComponent,
  IconModule,
  InfoLabelModule,
  InlineHelpModule,
  ListModule,
  ObjectStatusComponent,
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
  styleUrl: './setup-service-list-item.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthorizationModule,
    BusyIndicatorModule,
    ListModule,
    ButtonComponent,
    NgIf,
    ObjectStatusComponent,
    InfoLabelModule,
    IconModule,
    InlineHelpModule,
  ],
})
export class SetupServiceListItemComponent implements OnInit {
  @Input() serviceName: string
  @Input() setupDialogType?: Categories
  @Input() labelText?: string
  @Input() infoPopoverText?: string
  @Input() isSetupButtonDisabled?: boolean = false

  testId = signal('')
  constructor(private readonly luigiClient: LuigiClient) {}
  ngOnInit() {
    this.testId.set(this.setupDialogType.toLowerCase().replace(/ /g, '-'))
  }

  async openDialog(e: Event, dialogToOpen: Categories) {
    e.stopPropagation()
    switch (dialogToOpen) {
      case Categories.STATIC_SECURITY_CHECKS:
        await this.luigiClient
          .linkManager()
          .fromVirtualTreeRoot()
          .openAsModal('setup-validation', { title: 'Add Static Security Checks', width: '600px', height: '780px' })
        break
      case Categories.OPEN_SOURCE_CHECKS:
        await this.luigiClient
          .linkManager()
          .fromVirtualTreeRoot()
          .openAsModal('setup-osc', { title: 'Add Open Source Checks', width: '600px', height: '410px' })
    }
  }
}
