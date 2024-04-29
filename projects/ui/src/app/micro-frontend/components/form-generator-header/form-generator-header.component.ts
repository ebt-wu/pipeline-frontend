import { CommonModule } from '@angular/common'
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, OnInit } from '@angular/core'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'
import { ReactiveFormsModule } from '@angular/forms'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-header',
  templateUrl: './form-generator-header.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrls: ['./form-generator-header.component.css'],
})
export class PlatformFormGeneratorCustomHeaderElementComponent
  extends BaseDynamicFormGeneratorControl
  implements OnInit
{
  subheader: Promise<string>

  constructor() {
    super()
  }

  ngOnInit(): void {
    const additionalData = this.formItem.guiOptions?.additionalData as { subheader: () => Promise<string> }
    const subheader = additionalData.subheader

    if (subheader) {
      this.subheader = subheader()
    }
  }
}
