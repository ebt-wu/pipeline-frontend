import { CommonModule } from '@angular/common'
import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MessageStripModule, MessageStripType } from '@fundamental-ngx/core'
import {
  BaseDynamicFormGeneratorControl,
  InputComponent,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-message-strip',
  templateUrl: './form-generator-message-strip.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageStripModule, InputComponent],
  styleUrls: ['./form-generator-message-strip.component.css'],
})
export class PlatformFormGeneratorCustomMessageStripComponent
  extends BaseDynamicFormGeneratorControl
  implements OnInit
{
  type: MessageStripType = 'information'
  message = ''
  isValidationRequired = signal(false)
  isLoaded = signal(false)

  constructor() {
    super()
  }

  async ngOnInit() {
    const guiOptions = this.formItem.guiOptions
    const additionalData = guiOptions?.additionalData as {
      message: () => Promise<string>
      type: MessageStripType
      isValidationRequired: boolean
    }

    if (additionalData?.type) {
      this.type = additionalData.type
    }

    if (additionalData?.message) {
      this.message = await additionalData.message()
    }

    if (additionalData?.isValidationRequired) {
      this.isValidationRequired.set(additionalData.isValidationRequired)
    }

    this.isLoaded.set(true)
  }
}
