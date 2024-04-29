import { Component, ChangeDetectionStrategy } from '@angular/core'
import { RouterModule } from '@angular/router'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-app-router-outlet-component',
  standalone: true,
  template: `
    <router-outlet></router-outlet>
  `,
  imports: [RouterModule],
})
export class AppRouterOutletComponent {}
