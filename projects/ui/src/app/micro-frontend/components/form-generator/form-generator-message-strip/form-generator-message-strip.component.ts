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

export interface FormGeneratorMessageStripAdditionalData {
  message?: () => Promise<string>
  type?: MessageStripType
  addMargins?: boolean
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-message-strip',
  templateUrl: './form-generator-message-strip.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageStripModule, InputComponent],
  styleUrl: './form-generator-message-strip.component.css',
})
export class PlatformFormGeneratorCustomMessageStripComponent
  extends BaseDynamicFormGeneratorControl
  implements OnInit
{
  type: MessageStripType = 'information'
  message = ''
  isLoaded = signal(false)

  constructor() {
    super()
  }

  async ngOnInit() {
    const guiOptions = this.formItem.guiOptions
    const additionalData = guiOptions?.additionalData as FormGeneratorMessageStripAdditionalData

    if (additionalData?.type) {
      this.type = additionalData.type
    }

    if (additionalData?.message) {
      this.message = await additionalData.message()
    }

    this.isLoaded.set(true)
  }
}
