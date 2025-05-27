import { CommonModule } from '@angular/common'
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, OnInit, signal, OnDestroy } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { InlineHelpModule } from '@fundamental-ngx/core'
import { ButtonComponent } from '@fundamental-ngx/core/button'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'
import { Subscription } from 'rxjs'

export interface FormGeneratorHeaderAdditionalData<T = object> {
  headerText: string | ((formValue: T) => string | Promise<string>)
  subheaderHtml?: () => string | Promise<string>
  subheaderStyle?: string | object

  buttonText?: string
  buttonAction?: () => void
  buttonInlineHelpHtml?: string

  doubleTopMargin?: boolean
  ignoreTopMargin?: boolean
  ignoreBottomMargin?: boolean
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-header',
  templateUrl: './form-generator-header.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InlineHelpModule],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrl: './form-generator-header.component.css',
})
export class PlatformFormGeneratorCustomHeaderElementComponent
  extends BaseDynamicFormGeneratorControl
  implements OnInit, OnDestroy
{
  formValue$: Subscription = undefined

  headerText = signal<string>('')
  subheaderHtml = signal<string>(undefined)

  constructor() {
    super()
  }

  async ngOnInit(): Promise<void> {
    const additionalData = this.formItem.guiOptions?.additionalData as FormGeneratorHeaderAdditionalData

    if (typeof additionalData.headerText === 'function') {
      this.formValue$ = this.form.valueChanges.subscribe(
        (formValue) => void this.updateHeaderText(formValue as Record<string, object>),
      )
    }

    await this.updateHeaderText(this.form.value as Record<string, object>)

    if (additionalData.subheaderHtml) {
      this.subheaderHtml.set(await additionalData.subheaderHtml())
    }
  }

  ngOnDestroy(): void {
    if (this.formValue$ !== undefined) {
      this.formValue$.unsubscribe()
    }
  }

  async updateHeaderText(formValue: Record<string, object>) {
    const additionalData = this.formItem.guiOptions?.additionalData as FormGeneratorHeaderAdditionalData

    if (typeof additionalData.headerText === 'function') {
      this.headerText.set(await additionalData.headerText(formValue.ungrouped))
      return
    }

    this.headerText.set(additionalData.headerText)
  }
}
