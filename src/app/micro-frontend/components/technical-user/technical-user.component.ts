import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'

@Component({
  standalone: true,
  selector: 'app-techical-user-modal',
  template: `
    <h1>Test</h1>
  `,
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class TechicalUserModal {}
