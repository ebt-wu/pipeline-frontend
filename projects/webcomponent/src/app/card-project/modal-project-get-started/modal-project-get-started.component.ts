import { ChangeDetectionStrategy, Component } from '@angular/core'
import { DialogRef } from '@fundamental-ngx/core'

@Component({
  selector: 'app-cicd-modal-project-get-started',
  templateUrl: './modal-project-get-started.component.html',
  styleUrls: ['./modal-project-get-started.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
