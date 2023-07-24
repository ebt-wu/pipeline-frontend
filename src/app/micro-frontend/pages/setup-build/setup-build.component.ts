import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormModule, FormattedTextModule, FundamentalNgxCoreModule, RadioModule } from '@fundamental-ngx/core'

@Component({
  standalone: true,
  selector: 'app-setup-build',
  templateUrl: './setup-build.component.html',
  styleUrls: ['./setup-build.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, RadioModule, FormModule, FormattedTextModule],
})
export class SetupComponent {}
