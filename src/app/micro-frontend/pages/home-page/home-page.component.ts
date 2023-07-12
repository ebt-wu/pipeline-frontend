import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { AsyncPipe } from '@angular/common';
import { PlatformDynamicPageModule } from '@fundamental-ngx/platform/dynamic-page';
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  standalone: true,
  imports: [PlatformDynamicPageModule, AsyncPipe, FundamentalNgxCoreModule]
})
export class HomePageComponent {
  pageTitle = 'CI/CD'

  constructor() { }


  count = signal(0)

  createPipeline() {
    this.count.update(v => v + 1)
  }

}
