import { NgIf } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core'
import { Validators } from '@angular/forms'
import { KindExtensionName } from '@constants'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { Kinds, StepKey } from '@enums'
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
  FormGeneratorButtonAdditionalData,
  PlatformFormGeneratorCustomButtonComponent,
} from '../../../components/form-generator/form-generator-button/form-generator-button.component'
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

enum SCCSetupSteps {
  CAP_MTA_FORM = 'CAP_MTA_FORM',
  NO_CAP_MTA_SETUP = 'NO_CAP_MTA_SETUP',
  CAP_MTA_SETUP = 'CAP_MTA_SETUP',
}

const ModalSettingsBySetupStep = {
  [SCCSetupSteps.CAP_MTA_FORM]: {
    height: '215px',
    width: '450px',
  },
  [SCCSetupSteps.NO_CAP_MTA_SETUP]: {
    height: '260px',
    width: '450px',
  },
  [SCCSetupSteps.CAP_MTA_SETUP]: {
    height: '570px',
    width: '450px',
  },
}

@Component({
  selector: 'app-static-code-checks',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  SONARQUBE_DOCU_LINK =
    'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/sonarqube.html#sonarqube'
  ESLint_DOCU_LINK = 'https://pages.github.tools.sap/hyperspace/academy/bestpractice/CorpReq_FC1_CodingRules/#setup'
  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  formItems: DynamicFormItem[] = []
  usingCAPMTA: DynamicFormItem[] = []
  setUpSonarQubeCapChoice: string[] = ['Yes', 'No']

  formStep: SCCSetupSteps = SCCSetupSteps.CAP_MTA_FORM

  constructor(
    private formGeneratorService: FormGeneratorService,
    private readonly luigiClient: LuigiClient,
    private readonly luigiService: DxpLuigiContextService,
    private readonly sonarQubeService: SonarService,
  ) {
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomExtensionInfoComponent, ['extension-info'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomButtonComponent, ['button'])
  }

  ngOnInit() {
    this.usingCAPMTA = [
      {
        type: 'header',
        name: 'setUpSonarQubeCapHeader',
        message: '',
        guiOptions: {
          additionalData: {
            headerText: 'Are you using CAP (MTA) on this component?',
            ignoreTopMargin: true,
            ignoreBottomMargin: true,
          } as FormGeneratorHeaderAdditionalData,
        },
        when: () => {
          return this.isCapMtaFormStep()
        },
      },
      {
        type: 'radio',
        name: 'setUpSonarQubeCapChoice',
        message: '',
        choices: async () => {
          return this.setUpSonarQubeCapChoice
        },
        default: () => {
          return ''
        },
        validators: [Validators.required],
        when: () => {
          return this.isCapMtaFormStep()
        },
      },
    ]

    this.formItems = [
      {
        type: 'header',
        name: 'usingCAPMTAHeader',
        message: '',
        guiOptions: {
          additionalData: {
            headerText: 'Because you use CAP (MTA)',
            ignoreTopMargin: true,
            ignoreBottomMargin: true,
          } as FormGeneratorHeaderAdditionalData,
        },
        when: () => {
          return this.isCapMtaSetupStep()
        },
      },
      {
        type: 'extension-info',
        name: 'SonarqubeExtensionInfo',
        message: '',
        guiOptions: {
          additionalData: {
            extensionName: KindExtensionName[Kinds.SONAR_QUBE_PROJECT],
            popoverHtml: () => {
              return `<a href="${this.SONARQUBE_DOCU_LINK}" target="_blank" rel="noopener noreferrer">Learn more</a>`
            },
          } as FormGeneratorExtensionInfoAdditionalData,
        },
        when: () => {
          return this.isCapMtaSetupStep() || this.isNoCapMtaSetupStep()
        },
      },
      // ESLint Extension Info box
      {
        type: 'extension-info',
        name: 'ESLIntExtensionInfo',
        message: '',
        guiOptions: {
          additionalData: {
            extensionName: KindExtensionName[StepKey.ES_LINT],
            popoverHtml: () => {
              return `<a href="${this.ESLint_DOCU_LINK}" target="_blank" rel="noopener noreferrer">Learn more</a>`
            },
          } as FormGeneratorExtensionInfoAdditionalData,
        },
        when: () => {
          return this.isCapMtaSetupStep()
        },
      },
      {
        // hacky workaround to get padding
        type: 'header',
        name: 'setUpSonarQubeHeaderPadding',
        message: '',
        guiOptions: {
          additionalData: {
            headerText: '',
            ignoreTopMargin: true,
            ignoreBottomMargin: true,
          } as FormGeneratorHeaderAdditionalData,
        },
        when: () => {
          return this.isCapMtaSetupStep() || this.isNoCapMtaSetupStep()
        },
      },
      {
        type: 'header',
        name: 'setUpSonarQubeHeader',
        message: '',
        guiOptions: {
          additionalData: {
            headerText: '1. Set up SonarQube',
          } as FormGeneratorHeaderAdditionalData,
        },
        when: () => {
          return this.isCapMtaSetupStep()
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
        when: () => {
          return this.isCapMtaSetupStep() || this.isNoCapMtaSetupStep()
        },
      },
      {
        type: 'header',
        name: 'setUpESLintHeader',
        message: '',
        guiOptions: {
          additionalData: {
            headerText: '2. Set up ESLint',
            ignoreBottomMargin: true,
            subheaderHtml: async () => {
              return `After having installed Sonarqube, add ESLint to be compliant.
              <br /> 
              You will see this link again in the pull request description.`
            },
            subheaderStyle: {
              'font-size': '15px',
              color: 'black',
              'margin-top': '1rem',
              'margin-bottom': '0.5rem',
              'font-weight': '100',
            },
          } as FormGeneratorHeaderAdditionalData,
        },
        when: () => {
          return this.isCapMtaSetupStep()
        },
      },
      {
        type: 'button',
        name: 'addESLintButton',
        message: '',
        guiOptions: {
          additionalData: {
            label: 'Add Manually',
            glyph: 'action',
            type: 'standard',
            action: () => {
              window.open(this.ESLint_DOCU_LINK, '_blank', 'noopener, noreferrer')
            },
          } as FormGeneratorButtonAdditionalData,
        },
        when: () => {
          return this.isCapMtaSetupStep()
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

  isCapMtaFormStep() {
    return this.formStep === SCCSetupSteps.CAP_MTA_FORM
  }
  isNoCapMtaSetupStep() {
    return this.formStep === SCCSetupSteps.NO_CAP_MTA_SETUP
  }
  isCapMtaSetupStep() {
    return this.formStep === SCCSetupSteps.CAP_MTA_SETUP
  }

  continueToSetupStep(formData) {
    if (formData.ungrouped) {
      const choice = formData.ungrouped.setUpSonarQubeCapChoice as string
      if (choice === this.setUpSonarQubeCapChoice[0]) {
        this.formStep = SCCSetupSteps.CAP_MTA_SETUP
        this.luigiClient.linkManager().updateModalSettings(ModalSettingsBySetupStep[SCCSetupSteps.CAP_MTA_SETUP])
      } else if (choice === this.setUpSonarQubeCapChoice[1]) {
        this.formStep = SCCSetupSteps.NO_CAP_MTA_SETUP
        this.luigiClient.linkManager().updateModalSettings(ModalSettingsBySetupStep[SCCSetupSteps.NO_CAP_MTA_SETUP])
      }
    }
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  submitForm(): void {
    this.formGenerator.submit()
  }
}
