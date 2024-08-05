import { CommonModule } from '@angular/common'
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-info-box',
  templateUrl: './form-generator-info-box.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrls: ['./form-generator-info-box.component.css'],
})
export class PlatformFormGeneratorCustomInfoBoxComponent extends BaseDynamicFormGeneratorControl implements OnInit {
  instructions: Promise<string>

  constructor() {
    super()
  }

  ngOnInit(): void {
    const guiOptions = this.formItem.guiOptions
    const additionalData = guiOptions?.additionalData as { instructions: () => Promise<string> }

    if (additionalData?.instructions) {
      this.instructions = additionalData.instructions()
    }
  }
}
