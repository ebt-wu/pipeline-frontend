import { CommonModule } from '@angular/common'
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { AvatarComponent, IconComponent, InlineHelpModule, Placement } from '@fundamental-ngx/core'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'
import { Subscription } from 'rxjs'
import { ExtensionService } from '../../../services/extension.service'
import { ExtensionClass, Extensions } from '../../../services/extension.types'

export interface FormGeneratorExtensionInfoAdditionalData<T = object> {
  extensionName: Extensions | ((formValue: T) => Extensions | Promise<Extensions>)
  extensionClasses: ExtensionClass[]
  popoverHtml?: string | ((formValue: T) => string | Promise<string>)
  placement?: string
  isNoPopoverHtmlIcon?: boolean
  isNoPopoverHtmlIconLink?: string
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-extension-info',
  templateUrl: './form-generator-extension-info.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent, IconComponent, InlineHelpModule],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrl: './form-generator-extension-info.component.css',
})
export class PlatformFormGeneratorCustomExtensionInfoComponent
  extends BaseDynamicFormGeneratorControl
  implements OnInit, OnDestroy
{
  formValue$: Subscription = undefined
  extensionClasses: ExtensionClass[] = []

  extensionClass = signal<ExtensionClass>(undefined)
  extensionImage = signal<string>('')
  popoverHtml = signal<string>(undefined)
  placement = signal<Placement>('top')

  isNoPopoverHtmlIcon = signal<boolean>(false)
  isNoPopoverHtmlIconLink = signal<string>('')

  constructor(private readonly extensionService: ExtensionService) {
    super()
  }

  async ngOnInit(): Promise<void> {
    const additionalData = this.formItem.guiOptions?.additionalData as FormGeneratorExtensionInfoAdditionalData

    if (additionalData && additionalData.placement) {
      this.placement.set(additionalData.placement as Placement)
    }
    if (additionalData && additionalData.isNoPopoverHtmlIcon) {
      this.isNoPopoverHtmlIcon.set(additionalData.isNoPopoverHtmlIcon)
    }
    if (additionalData && additionalData.isNoPopoverHtmlIconLink) {
      this.isNoPopoverHtmlIconLink.set(additionalData.isNoPopoverHtmlIconLink)
    }

    if (typeof additionalData.extensionName === 'function' || typeof additionalData.popoverHtml === 'function') {
      this.formValue$ = this.form.valueChanges.subscribe((formValue) => {
        void this.updateExtensionClass(formValue as Record<string, object>)
      })
    }

    this.extensionClasses = additionalData.extensionClasses
    await this.updateExtensionClass(this.form.value as Record<string, object>)
  }

  ngOnDestroy(): void {
    if (this.formValue$ !== undefined) {
      this.formValue$.unsubscribe()
    }
  }

  async updateExtensionClass(formValue: Record<string, object>): Promise<void> {
    const additionalData = this.formItem.guiOptions?.additionalData as FormGeneratorExtensionInfoAdditionalData

    let extensionName = ''
    if (typeof additionalData.extensionName === 'function') {
      extensionName = await additionalData.extensionName(formValue.ungrouped)
    } else {
      extensionName = additionalData.extensionName
    }

    if (extensionName === null) {
      return
    }

    this.extensionClass.set(
      this.extensionClasses.find((extensionClass) => extensionClass.name === extensionName.toString()),
    )
    if (this.extensionClass() === undefined) {
      return
    }

    this.extensionImage.set(this.extensionService.getIcon(this.extensionClass()))

    await this.updatePopoverHtml(formValue)
  }

  async updatePopoverHtml(formValue: Record<string, object>): Promise<void> {
    const additionalData = this.formItem.guiOptions?.additionalData as FormGeneratorExtensionInfoAdditionalData

    if (!additionalData.popoverHtml) {
      return
    }

    if (typeof additionalData.popoverHtml === 'function') {
      this.popoverHtml.set(await additionalData.popoverHtml(formValue?.ungrouped))
      return
    }

    this.popoverHtml.set(additionalData.popoverHtml)
  }
}
