import { CdkScrollable } from '@angular/cdk/scrolling'
import { Component } from '@angular/core'
import { CardModule, DialogModule, DialogRef, ScrollbarDirective } from '@fundamental-ngx/core'

@Component({
  selector: 'app-cicd-modal-project-get-started',
  templateUrl: './modal-project-get-started.component.html',
  styleUrls: ['./modal-project-get-started.component.css'],
  standalone: true,
  imports: [CardModule, DialogModule, CdkScrollable, ScrollbarDirective],
})
export class ModalProjectGetStartedComponent {
  constructor(public dialogRef: DialogRef) {}

  navigateToComponents() {
    this.dialogRef.data.luigiClient
      .linkManager()
      .navigate(`/projects/${this.dialogRef.data.currentProjectId}/components`)
    this.dialogRef.close()
  }
}
