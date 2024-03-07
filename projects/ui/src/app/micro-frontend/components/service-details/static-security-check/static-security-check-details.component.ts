import { Component, Input, OnInit, signal } from '@angular/core'
import { BusyIndicatorModule, ButtonModule, FacetModule, FormLabelModule, LinkModule } from '@fundamental-ngx/core'
import { CumulusPipeline, GetGitHubAdvancedSecurityQuery } from '@generated/graphql'
import { PipelineService } from '../../../services/pipeline.service'
import { debounceTime, firstValueFrom, Observable } from 'rxjs'
import { Kinds } from '@enums'
import { Pipeline } from '@types'
import { CumulusService } from '../../../services/cumulus.service'
import { AuthorizationTestingModule } from '@dxp/ngx-core/authorization'
import { AsyncPipe, NgIf } from '@angular/common'

@Component({
  standalone: true,
  selector: 'static-security-check-details',
  templateUrl: './static-security-check-details.component.html',
  styleUrls: ['./static-security-check-details.component.css'],
  imports: [
    BusyIndicatorModule,
    ButtonModule,
    FacetModule,
    LinkModule,
    FormLabelModule,
    AuthorizationTestingModule,
    AsyncPipe,
    NgIf,
  ],
})
export class StaticSecurityCheckDetailsComponent implements OnInit {
  @Input() serviceDetails: GetGitHubAdvancedSecurityQuery['getGitHubAdvancedSecurity'] & {
    repoUrl: string
    githubRepoName: string
  }

  watch$: Observable<Pipeline>
  cumulusInfo: CumulusPipeline

  loading = signal(false)
  error: string
  constructor(
    private readonly pipelineService: PipelineService,
    private readonly cumulusService: CumulusService,
  ) {}

  async ngOnInit() {
    this.loading.set(true)
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    const cumulusRef = ((await firstValueFrom(this.watch$)) as Pipeline).resourceRefs.find(
      (ref) => ref.kind === Kinds.CUMULUS_PIPELINE,
    )

    if (cumulusRef && cumulusRef.name) {
      this.cumulusInfo = await firstValueFrom(this.cumulusService.getCumulusPipeline(cumulusRef.name))
    }
    this.loading.set(false)
  }
}
