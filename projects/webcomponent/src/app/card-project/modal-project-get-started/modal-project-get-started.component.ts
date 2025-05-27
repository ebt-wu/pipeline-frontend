import { CdkScrollable } from '@angular/cdk/scrolling'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { CardModule, DialogModule, DialogRef, ScrollbarDirective } from '@fundamental-ngx/core'

interface DialogData {
  luigiClient: LuigiClient
  currentProjectId: string
  title: string
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cicd-modal-project-get-started',
  templateUrl: './modal-project-get-started.component.html',
  styleUrl: './modal-project-get-started.component.css',
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
