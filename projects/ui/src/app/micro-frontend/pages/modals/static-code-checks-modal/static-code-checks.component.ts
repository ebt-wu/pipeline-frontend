import { NgIf } from '@angular/common'
import { Component, OnInit, signal, ViewChild } from '@angular/core'
import { Validators } from '@angular/forms'
import { KindExtensionName } from '@constants'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { Kinds } from '@enums'
import {
  BarComponent,
  BarLeftDirective,
  BarRightDirective,
  BusyIndicatorComponent,
  ButtonComponent,
} from '@fundamental-ngx/core'
import { DynamicFormItem, FormGeneratorComponent, MessagePopoverFormWrapperComponent } from '@fundamental-ngx/platform'
import { FormGeneratorService } from '@fundamental-ngx/platform/form'
import { firstValueFrom } from 'rxjs'
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component'
import {
  FormGeneratorExtensionInfoAdditionalData,
  PlatformFormGeneratorCustomExtensionInfoComponent,
} from '../../../components/form-generator/form-generator-extension-info/form-generator-extension-info.component'
import {
  FormGeneratorHeaderAdditionalData,
  PlatformFormGeneratorCustomHeaderElementComponent,
} from '../../../components/form-generator/form-generator-header/form-generator-header.component'
import { SonarService } from '../../../services/sonar.service'

interface StaticCodeChecksFormValue {
  sonarProjectName?: string
}

@Component({
  selector: 'app-static-code-checks',
  standalone: true,
  imports: [
    BarComponent,
    ErrorMessageComponent,
    MessagePopoverFormWrapperComponent,
    FormGeneratorComponent,
    ButtonComponent,
    BusyIndicatorComponent,
    NgIf,
    BarLeftDirective,
    BarRightDirective,
  ],
  templateUrl: './static-code-checks.component.html',
  styleUrl: './static-code-checks.component.css',
})
export class StaticCodeChecksComponent implements OnInit {
  errorMessage = signal<string>('')
  loading = signal<boolean>(null)
  SONARQUBE_DOCU_LINK = 'https://google.com' // todo
  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  formItems: DynamicFormItem[] = []

  constructor(
    private formGeneratorService: FormGeneratorService,
    private readonly luigiClient: LuigiClient,
    private readonly luigiService: DxpLuigiContextService,
    private readonly sonarQubeService: SonarService,
  ) {
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomExtensionInfoComponent, ['extension-info'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
  }

  ngOnInit() {
    this.formItems = [
      {
        type: 'extension-info',
        name: 'SonarqubeExtensionInfo',
        message: '',
        guiOptions: {
          additionalData: {
            extensionName: KindExtensionName[Kinds.SONAR_QUBE_PROJECT],
            popoverHtml: () => {
              return `
							<a
								href="${this.SONARQUBE_DOCU_LINK}"
								target="_blank"
								rel="noopener noreferrer">Learn more</a>`
            },
          } as FormGeneratorExtensionInfoAdditionalData,
        },
      },
      {
        // hacky workaround to get padding
        type: 'header',
        name: 'setUpSonarQubeHeader',
        message: '',
        guiOptions: {
          additionalData: {
            headerText: '',
            ignoreTopMargin: true,
          } as FormGeneratorHeaderAdditionalData,
        },
      },
      {
        type: 'input',
        name: 'sonarProjectName',
        message: 'SonarQube Project Name',
        validators: [Validators.required],
        default: async () => {
          const context = await this.luigiService.getContextAsync()
          return context.componentId.toLowerCase()
        },
        guiOptions: {
          hint: '',
        },
      },
    ]
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  onFormSubmitted(value: StaticCodeChecksFormValue) {
    if (value.sonarProjectName) {
      firstValueFrom(this.sonarQubeService.createSonarqubeProject(value.sonarProjectName))
        .then((result) => {
          if (result) {
            this.luigiClient.uxManager().closeCurrentModal()
          } else {
            this.errorMessage.set('Error creating SonarQube project')
          }
        })
        .catch((error) => {
          this.errorMessage.set(error.message)
        })
    }
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  submitForm(): void {
    this.formGenerator.submit()
  }
}
