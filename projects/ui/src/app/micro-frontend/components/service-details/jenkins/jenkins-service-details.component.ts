import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core'
import { BusyIndicatorModule, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { GetJenkinsPipelineQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-jenkins-service-details',
  templateUrl: './jenkins-service-details.component.html',
  standalone: true,
  styleUrl: './jenkins-service-details.component.css',
  imports: [BusyIndicatorModule, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
})
export class JenkinServiceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  @Input() serviceDetails: GetJenkinsPipelineQuery['getJenkinsPipeline']

  loading = signal(false)

  originURL: string

  async ngOnInit() {
    this.loading.set(true)
    await super.ngOnInit()
    const jobURL = new URL(this.serviceDetails.jobUrl)
    this.originURL = jobURL.origin
    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-tools/build/jenkins.html',
      '_blank',
      'noopener, noreferrer',
    )
  }
}
