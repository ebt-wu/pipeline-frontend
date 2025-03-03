import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { ServiceStatus } from '@enums'
import {
  BusyIndicatorComponent,
  IconComponent,
  InlineHelpDirective,
  ObjectStatusComponent,
} from '@fundamental-ngx/core'
import { NgIf } from '@angular/common'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-status-icon',
  standalone: true,
  imports: [ObjectStatusComponent, InlineHelpDirective, BusyIndicatorComponent, IconComponent, NgIf],
  templateUrl: './status-icon.component.html',
  styleUrl: './status-icon.component.css',
})
export class StatusIconComponent {
  @Input() statusIconConfig: { statusIconType: string; statusIconInlineHelpText?: string } = { statusIconType: '' }

  protected readonly serviceStatus = ServiceStatus
}
