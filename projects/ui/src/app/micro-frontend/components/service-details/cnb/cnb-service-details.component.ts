import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { Cnb } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-cnb-service-details',
  templateUrl: './cnb-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './cnb-service-details.component.css',
})
export class CnbServiceDetailsComponent {
  constructor() {}

  @Input() serviceDetails: Cnb

  getCnbBuilderLinkUrl(builder: string): string {
    switch (builder) {
      case 'paketobuildpacks/builder-jammy-full':
        return 'https://github.com/paketo-buildpacks/builder-jammy-full'
      case 'paketobuildpacks/builder-jammy-base':
        return 'https://github.com/paketo-buildpacks/builder-jammy-base'
      case 'paketobuildpacks/builder-jammy-tiny':
        return 'https://github.com/paketo-buildpacks/builder-jammy-tiny'
      case 'proxy-unified-runtime-dmz.int.repositories.cloud.sap/builder/jammy:latest':
        return 'https://github.tools.sap/unified-runtime/builder-jammy'
      case 'proxy-unified-runtime-dmz.int.repositories.cloud.sap/builder/noble:latest':
        return 'https://github.tools.sap/unified-runtime/builder-noble'
      default:
        return undefined
    }
  }

  openDocumentation() {
    // TODO: write and link correct documentation
    window.open('https://pages.github.tools.sap/hyperspace/cicd-setup-documentation', '_blank', 'noopener,noreferrer')
  }
}
