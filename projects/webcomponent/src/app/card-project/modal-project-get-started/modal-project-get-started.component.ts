import { CdkScrollable } from '@angular/cdk/scrolling'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { CardModule, DialogModule, DialogRef, ScrollbarDirective } from '@fundamental-ngx/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'

interface DialogData {
  luigiClient: LuigiClient
  currentProjectId: string
  title: string
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-cicd-modal-project-get-started',
  templateUrl: './modal-project-get-started.component.html',
  styleUrls: ['./modal-project-get-started.component.css'],
  imports: [CardModule, DialogModule, CdkScrollable, ScrollbarDirective],
})
export class ModalProjectGetStartedComponent {
  constructor(public dialogRef: DialogRef<DialogData>) {}

  navigateToComponents() {
    this.dialogRef.data.luigiClient
      .linkManager()
      .navigate(`/projects/${this.dialogRef.data.currentProjectId}/components`)
    this.dialogRef.close()
  }
}
