import { CommonModule } from '@angular/common'
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ButtonComponent } from '@fundamental-ngx/core/button'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

export type FormGeneratorHeaderAdditionalData = {
  header: string
  subheader?: () => Promise<string>
  subheaderStyle?: string | object

  buttonText?: string
  buttonAction?: () => void

  doubleTopMargin?: boolean
  ignoreTopMargin?: boolean
  ignoreBottomMargin?: boolean
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-header',
  templateUrl: './form-generator-header.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrl: './form-generator-header.component.css',
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
    const additionalData = this.formItem.guiOptions?.additionalData as FormGeneratorHeaderAdditionalData
    const subheader = additionalData.subheader

    if (subheader) {
      this.subheader = subheader()
    }
  }
}
