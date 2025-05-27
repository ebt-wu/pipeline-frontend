import { ChangeDetectionStrategy, Component } from '@angular/core'
import { SafeResourceUrl } from '@angular/platform-browser'
import { RouterOutlet } from '@angular/router'
import { ThemingService } from '@fundamental-ngx/core/theming'
import { ContentDensity, ContentDensityService } from '@fundamental-ngx/core/utils'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet],
})
export class AppComponent {
  cssUrl: SafeResourceUrl
  cssCustomUrl: SafeResourceUrl
  contentDensity: ContentDensity = 'compact'
  readonly themeQueryParamName = 'sap-theme'

  constructor(
    private themingService: ThemingService,
    private contentDensityService: ContentDensityService,
  ) {
    this.themingService.init()
    this.contentDensityService.contentDensity.next(this.contentDensity)
  }
}
