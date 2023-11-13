import { ChangeDetectionStrategy, Component } from '@angular/core'
import { SafeResourceUrl } from '@angular/platform-browser'
import { ContentDensity, ContentDensityService } from '@fundamental-ngx/core/utils'
import { ThemingService } from '@fundamental-ngx/core/theming'
import { RouterOutlet } from '@angular/router'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
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
