import { Component } from '@angular/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import {
  BarComponent,
  ButtonComponent,
  ContentDensityDirective,
  IllustratedMessageActionsComponent,
  IllustratedMessageComponent,
  IllustratedMessageTextDirective,
  IllustratedMessageTitleDirective,
  SvgConfig,
} from '@fundamental-ngx/core'
import { toolsSvg } from '../../../../../assets/ts-svg/tools'

@Component({
  selector: 'app-static-code-checks-no-build-modal',
  standalone: true,
  imports: [
    IllustratedMessageComponent,
    IllustratedMessageTitleDirective,
    IllustratedMessageActionsComponent,
    IllustratedMessageTextDirective,
    ButtonComponent,
    BarComponent,
    ContentDensityDirective,
  ],
  templateUrl: './static-code-checks-no-build-modal.component.html',
  styleUrl: 'static-code-checks-no-build-modal.component.css',
})
export class StaticCodeChecksNoBuildModalComponent {
  SONARQUBE_DOCU_LINK =
    'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/sonarqube.html#sonarqube'
  constructor(private readonly luigiClient: LuigiClient) {}

  async openSetupBuildModal() {
    await this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('setup', {
      title: 'Set up Build Pipeline',
      width: '36rem',
      height: '44rem',
    })
  }

  svgConfig: SvgConfig = {
    spot: {
      file: toolsSvg,
      id: 'tools',
    },
  }

  openDocumentation() {
    window.open(this.SONARQUBE_DOCU_LINK, '_blank', 'noopener noreferrer')
  }

  closeDialog() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
