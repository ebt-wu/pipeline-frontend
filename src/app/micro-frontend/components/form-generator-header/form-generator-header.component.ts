import { CommonModule } from '@angular/common'
import { Component, NO_ERRORS_SCHEMA } from '@angular/core'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

@Component({
  selector: 'fdp-form-generator-header',
  template: `
    <ng-container [formGroup]="form">
      <ng-container [formGroupName]="formGroupName">
        <div class="bottom-margin">
          <h2 class="header" [ngClass]="formItem.guiOptions?.additionalData?.ignoreTopMargin ? '' : 'top-margin'">
            {{ formItem.guiOptions?.additionalData?.header }}
          </h2>
          <p *ngIf="subheader" class="subheader" [innerHTML]="subheader | async"></p>
        </div>
      </ng-container>
    </ng-container>
  `,
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrls: ['./form-generator-header.component.css'],
})
export class PlatformFormGeneratorCustomHeaderElementComponent extends BaseDynamicFormGeneratorControl {
  subheader: Promise<string>

  constructor() {
    super()
  }

  ngOnInit(): void {
    if (this.formItem.guiOptions?.additionalData?.subheader) {
      this.subheader = this.formItem.guiOptions.additionalData.subheader()
    }
  }
}
