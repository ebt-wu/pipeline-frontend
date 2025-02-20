import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  ViewChild,
} from '@angular/core'
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ProgrammingLanguages } from '@constants'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { Kinds, Languages, ValidationTools } from '@enums'
import { FormModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import {
  DynamicFormFieldGroupMap,
  DynamicFormItem,
  FormGeneratorComponent,
  FormGeneratorService,
  FundamentalNgxPlatformModule,
  InputDynamicFormFieldItem,
  PlatformMessagePopoverModule,
  SelectDynamicFormFieldItem,
  SelectItem,
} from '@fundamental-ngx/platform'
import { BuildTool, Orchestrators } from '@generated/graphql'
import { EntityContext, Pipeline } from '@types'
import { debounceTime, first, firstValueFrom, interval, Observable, skipWhile, Subscription, timeout } from 'rxjs'
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component'
import { GithubAdvancedSecurityService } from '../../../services/github-advanced-security.service'
import { GithubService } from '../../../services/github.service'
import { PipelineService } from '../../../services/pipeline.service'
import {
  FormGeneratorInfoBoxAdditionalData,
  PlatformFormGeneratorCustomInfoBoxComponent,
} from '../../../components/form-generator/form-generator-info-box/form-generator-info-box.component'
import {
  FormGeneratorMessageStripAdditionalData,
  PlatformFormGeneratorCustomMessageStripComponent,
} from '../../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { PlatformFormGeneratorCustomValidatorComponent } from '../../../components/form-generator/form-generator-validator/form-generator-validator.component'
import { GithubActionsFormService } from '../../../services/forms/github-actions-form.service'
import { GithubActionsService } from '../../../services/github-actions.service'
import {
  FormGeneratorHeaderAdditionalData,
  PlatformFormGeneratorCustomHeaderElementComponent,
} from '../../../components/form-generator/form-generator-header/form-generator-header.component'
import {
  FormGeneratorExtensionInfoAdditionalData,
  PlatformFormGeneratorCustomExtensionInfoComponent,
} from '../../../components/form-generator/form-generator-extension-info/form-generator-extension-info.component'
import { Extensions } from '../../../services/extension.types'
import { PlatformFormGeneratorCustomReadOnlyInputComponent } from '../../../components/form-generator/form-generator-read-only-input/form-generator-read-only-input.component'
import { CxOneService } from '../../../services/cxone.service'
import { FeatureFlagService } from '../../../services/feature-flag.service'

type SetupValidationFormValue = {
  language?: Languages
  validationTools?: ValidationTools[]
  cxOneApplicationName?: string
  cxOneProjectName?: string
  cxOnePreset?: string
}

const GHAS_DOCUMENTATION_LINK =
  'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/ghas.html'
const CX_ONE_DOCUMENTATION_LINK =
  'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/cxone.html'
const VALIDATE_CODE_DOCUMENTATION_LINK =
  'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/validate-services.html'

const ValidationToolExtensionName = {
  [ValidationTools.CX]: Extensions.CHECKMARX_ONE,
  [ValidationTools.GHAS]: Extensions.GITHUB_ADVANCED_SECURITY,
}

const CxOnePresets = new Map<Languages, string[]>([
  [
    Languages.JAVASCRIPT,
    [
      'SAP_Corp_JavaScript',
      'SAP_Corp_JavaScript_UI5',
      'SAP_Corp_JavaScript_Client',
      'SAP_Corp_JavaScript_Client_UI5',
      'SAP_Corp_JavaScript_Server',
      'SAP_Corp_JavaScript_Server_XSJS',
      'SAP_Corp_Microservice_Backend',
      'SAP_Default_JavaScript_Python',
      'SAP_Default_PHP_JavaScript',
      'SAP_SE_Fiori',
    ],
  ],
  [
    Languages.JAVA_NODE_CAP,
    [
      'SAP_Corp_MTA_JavaScript',
      'SAP_Corp_MTA_JavaScript_XSJS',
      'SAP_Corp_MTA_Java_JavaScript',
      'SAP_Corp_Microservice_Backend',
    ],
  ],
  [Languages.GO, ['SAP_Corp_Microservice_Backend', 'SAP_Default_Go', 'SAP_Default_Go_JavaScript']],
  [
    Languages.OTHER,
    [
      'SAP_Default_CSharp_CPP',
      'SAP_Default_JavaScript_Python',
      'SAP_Default_Kotlin',
      'SAP_Default_Lua',
      'SAP_Default_NET',
      'SAP_Default_Perl',
      'SAP_Default_PHP_JavaScript',
      'SAP_Default_Python',
      'SAP_Default_Groovy',
      'SAP_Default_Scala',
      'SAP_Default_Ruby',
      'SAP_Default_Rust',
      'SAP_Corp_Microservice_Backend',
    ],
  ],
])

function getCxOnePresets(language: Languages): string[] {
  if (!CxOnePresets.has(language)) {
    return CxOnePresets.get(Languages.OTHER)
  }
  return CxOnePresets.get(language)
}

function getBuidTool(language: Languages): BuildTool {
  switch (language) {
    case Languages.GO:
      return BuildTool.Golang
    case Languages.JAVA:
      return BuildTool.Maven
    case Languages.JAVASCRIPT:
      return BuildTool.Npm
    case Languages.PYTHON:
      return BuildTool.Python
    case Languages.JAVA_NODE_CAP:
      return BuildTool.Mta
    default:
      return null
  }
}

function getRequiredValidationTools(language: Languages): ValidationTools[] {
  switch (language) {
    case Languages.JAVA:
      return [ValidationTools.GHAS]
    case Languages.JAVASCRIPT:
      return [ValidationTools.CX]
    case Languages.JAVA_NODE_CAP:
      return [ValidationTools.GHAS, ValidationTools.CX]
    default:
      return []
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-setup-validation',
  templateUrl: './setup-validation-modal.component.html',
  styleUrl: './setup-validation-modal.component.css',
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    FormModule,
    FundamentalNgxPlatformModule,
    ErrorMessageComponent,
    PlatformMessagePopoverModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SetupValidationModalComponent implements OnInit, OnDestroy {
  watch$: Observable<Pipeline>
  watchCxOneApplication$: Subscription

  loading = signal(false)
  errorMessage = signal('')

  // FormSteps:
  // 1 - CxOne, GHAS
  // 2 - GithubActions, if required
  formStep = signal<1 | 2>(1)
  submitButtonDisabled: Signal<boolean> = signal(false)
  submitButtonText: Signal<'Add Checks' | 'Continue'> = signal('Continue')
  isSolinasAppInstalled = signal<boolean>(false)
  prevLanguage = signal<Languages | null>(null)

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  formItems: DynamicFormItem[] = []

  validationToolSelectFormItems: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'recommendationHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData<SetupValidationFormValue>>{
          headerText: (formValue) => {
            const language = ProgrammingLanguages.find((language) => language.id == formValue.language)

            return `Because you use ${language.displayName}`
          },
          ignoreBottomMargin: true,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) return false

        return getRequiredValidationTools(formValue.language).length >= 1
      },
    },
    {
      type: 'extension-info',
      name: 'recommendationExtensionInfo1',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorExtensionInfoAdditionalData<SetupValidationFormValue>>{
          extensionName: (formValue) => {
            const requiredValidationTools = getRequiredValidationTools(formValue.language)
            if (requiredValidationTools.length === 0) {
              return null
            }
            return ValidationToolExtensionName[requiredValidationTools[0]]
          },
          popoverHtml: (formValue) => {
            const requiredValidationTools = getRequiredValidationTools(formValue.language)
            let link = GHAS_DOCUMENTATION_LINK
            if (requiredValidationTools[0] === ValidationTools.CX) {
              link = CX_ONE_DOCUMENTATION_LINK
            }
            return `
							<a
								href="${link}"
								target="_blank"
								rel="noopener noreferrer">Learn more.</a>`
          },
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) return false

        return getRequiredValidationTools(formValue.language).length >= 1
      },
    },
    {
      type: 'extension-info',
      name: 'recommendationExtensionInfo2',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorExtensionInfoAdditionalData<SetupValidationFormValue>>{
          extensionName: (formValue) => {
            const requiredValidationTools = getRequiredValidationTools(formValue.language)
            if (requiredValidationTools.length !== 2) {
              return null
            }
            return ValidationToolExtensionName[requiredValidationTools[1]]
          },
          popoverHtml: (formValue) => {
            const requiredValidationTools = getRequiredValidationTools(formValue.language)
            let link = GHAS_DOCUMENTATION_LINK
            if (requiredValidationTools[1] === ValidationTools.CX) {
              link = CX_ONE_DOCUMENTATION_LINK
            }
            return `
							<a
								href="${link}"
								target="_blank"
								rel="noopener noreferrer">Learn more.</a>`
          },
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) return false

        return getRequiredValidationTools(formValue.language).length === 2
      },
    },
    {
      type: 'header',
      name: 'validationToolsHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData<SetupValidationFormValue>>{
          headerText: 'Select services',
          buttonText: 'Need Help?',
          buttonInlineHelpHtml: `
						Unsure which service to choose?<br/>
						<a
							href="https://github.wdf.sap.corp/pages/Security-Testing/doc/security%20testing/tools/#sast-tools"
							target="_blank"
							rel="noopener noreferred">Open Recommendations</a><br/><br/>
						
						Need more service info?<br/>
						<a
							href="${GHAS_DOCUMENTATION_LINK}"
							target="_blank"
							rel="noopener noreferrer">GitHub Advanced Security Documentation</a><br/>
						<a
							href="${CX_ONE_DOCUMENTATION_LINK}"
							target="_blank"
							rel="noopener noreferrer">CxOne Documentation</a>
					`,
          ignoreBottomMargin: true,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) return false

        return getRequiredValidationTools(formValue.language).length === 0
      },
    },
    {
      type: 'checkbox',
      name: 'validationTools',
      choices: () => [ValidationTools.GHAS, ValidationTools.CX],
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) return false

        return getRequiredValidationTools(formValue.language).length === 0
      },
      validators: [Validators.required],
    },
  ]

  cxOneFormItems: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'cxOneSectionHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData<SetupValidationFormValue>>{
          headerText: 'Set up CxOne',
          ignoreBottomMargin: true,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) {
          return false
        }
        if (!formValue.validationTools) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.CX)) {
          return false
        }

        return true
      },
    },
    {
      type: 'header',
      name: 'cxOneApplicationMissing',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData<SetupValidationFormValue>>{
          subheaderHtml: () => 'No account found',
          subheaderStyle: 'margin: 0.5rem 0; color: var(--sapTextColor);',
          ignoreTopMargin: true,
          ignoreBottomMargin: true,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) {
          return false
        }
        if (!formValue.validationTools) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.CX)) {
          return false
        }

        return formValue.cxOneApplicationName === null
      },
    },
    {
      type: 'validator',
      name: 'cxOneApplicationMissingValidator',
      message: '',
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) {
          return false
        }
        if (!formValue.validationTools) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.CX)) {
          return false
        }

        return formValue.cxOneApplicationName === null
      },
      validators: [Validators.required],
    },
    {
      type: 'info',
      name: 'cxOneApplicationNote',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorInfoBoxAdditionalData>{
          header: 'Add CxOne account',
          instructions: async () => {
            const context = await this.luigiService.getContextAsync()
            return `
							<ol>
								<li>
									Install the CxOne extension from the <a href="${context.frameBaseUrl}/projects/${context.projectId}/marketplace" target="_blank" rel="noopener noreferrer">catalog</a>
								</li>
								<li>Create a CxOne account</li>
							</ol>
						`
          },
          ignoreTopMargin: true,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) {
          return false
        }
        if (!formValue.validationTools) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.CX)) {
          return false
        }

        return formValue.cxOneApplicationName === null
      },
    },
    {
      type: 'read-only-input',
      name: 'cxOneApplicationName',
      message: 'CxOne Account',
      default: () => null,
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) {
          return false
        }
        if (!formValue.validationTools) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.CX)) {
          return false
        }

        return formValue.cxOneApplicationName !== null
      },
      validators: [Validators.required],
    },
    {
      type: 'input',
      name: 'cxOneProjectName',
      message: 'CxOne Project Name',
      default: async () => {
        const context = await this.luigiService.getContextAsync()
        return context.componentId
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) {
          return false
        }
        if (!formValue.validationTools) {
          return false
        }
        if (formValue.cxOneApplicationName === null) {
          return false
        }

        return formValue.validationTools.includes(ValidationTools.CX)
      },
      validators: [Validators.required],
    },
    {
      type: 'select',
      name: 'cxOnePreset',
      message: 'Checkmarx Preset',
      placeholder: 'Select',
      choices: (formValue: SetupValidationFormValue) => getCxOnePresets(formValue.language),
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) {
          return false
        }
        if (!formValue.validationTools) {
          return false
        }
        if (formValue.cxOneApplicationName === null) {
          return false
        }

        return formValue.validationTools.includes(ValidationTools.CX)
      },
      validators: [Validators.required],
    },
    {
      // a hacky way to show a link through subheader to avoid
      // implementing yet another custom form-generator component
      type: 'header',
      name: 'cxOnePresetSupportLink',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData<SetupValidationFormValue>>{
          headerText: '',
          ignoreTopMargin: true,
          ignoreBottomMargin: true,
          subheaderHtml: () => `
						<a
							href="https://github.wdf.sap.corp/pages/Security-Testing/doc/cxone/Presets/#javascript-and-typescript-presets"
							target="_blank" rel="noopener noreferrer">
							Need help selecting the right preset?
						</a>`,
          subheaderStyle: `
						margin-top: -0.7rem;
						font-size: 12px;
					`,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (this.formStep() !== 1) {
          return false
        }
        if (!formValue.validationTools) {
          return false
        }
        if (formValue.cxOneApplicationName === null) {
          return false
        }

        return formValue.validationTools.includes(ValidationTools.CX)
      },
    },
  ]

  githubActionsDiscmlaimerFormItems: DynamicFormItem[] = [
    {
      type: 'message-strip',
      name: 'githubActionsDisclaimerGhas',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorMessageStripAdditionalData>{
          message: () =>
            Promise.resolve(`
							GitHub Advanced Security will run on a <b>GitHub Actions workflow.</b>
							<a
								href="${GHAS_DOCUMENTATION_LINK}"
								target="_blank" rel="noopener noreferrer">
								Learn More
							</a>
						`),
          addMargins: true,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (!formValue.validationTools) {
          return false
        }
        if (formValue.validationTools.length !== 1) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.GHAS)) {
          return false
        }
        if (this.formStep() === 1) {
          return this.isSolinasAppInstalled()
        }
        return true
      },
    },
    {
      type: 'message-strip',
      name: 'githubActionsDisclaimerCxOne',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorMessageStripAdditionalData>{
          message: () =>
            Promise.resolve(`
							CxOne will run on a <b>GitHub Actions workflow.</b>
							<a
								href="${CX_ONE_DOCUMENTATION_LINK}"
								target="_blank" rel="noopener noreferrer">
								Learn More
							</a>
						`),
          addMargins: true,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (!formValue.validationTools) {
          return false
        }
        if (formValue.validationTools.length !== 1) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.CX)) {
          return false
        }
        if (this.formStep() === 1) {
          return this.isSolinasAppInstalled()
        }
        return true
      },
    },
    {
      type: 'message-strip',
      name: 'githubActionsDisclaimerGhasAndCxOne',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorMessageStripAdditionalData>{
          message: () =>
            Promise.resolve(`
							GitHub Advanced Security and CxOne will run as <b>GitHub Actions workflows.</b>
							<a
								href="${VALIDATE_CODE_DOCUMENTATION_LINK}"
								target="_blank" rel="noopener noreferrer">
								Learn More
							</a>
						`),
          addMargins: true,
        },
      },
      when: (formValue: SetupValidationFormValue) => {
        if (!formValue.validationTools) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.GHAS)) {
          return false
        }
        if (!formValue.validationTools.includes(ValidationTools.CX)) {
          return false
        }
        if (this.formStep() === 1) {
          return this.isSolinasAppInstalled()
        }
        return true
      },
    },
  ]

  constructor(
    private readonly luigiClient: LuigiClient,
    private readonly luigiService: DxpLuigiContextService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly githubService: GithubService,
    private readonly pipelineService: PipelineService,
    private readonly githubAdvancedSecurityService: GithubAdvancedSecurityService,
    private readonly githubActionsService: GithubActionsService,
    private readonly cxOneService: CxOneService,
    private readonly formGeneratorService: FormGeneratorService,
    private readonly githubActionsFormService: GithubActionsFormService,
  ) {
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomExtensionInfoComponent, ['extension-info'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomReadOnlyInputComponent, ['read-only-input'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])

    this.submitButtonText = computed(() => {
      if (this.formStep() === 1 && !this.isSolinasAppInstalled()) {
        return 'Continue'
      }
      return 'Add Checks'
    })
  }

  async ngOnInit() {
    this.loading.set(true)

    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    this.watchCxOneApplication$ = this.watchCxOneApplication()

    const githubMetadata = await this.githubService.getGithubMetadata()
    const isCxOneInstallationEnabled = await this.featureFlagService.isCxOneInstallationEnabled()
    if (!isCxOneInstallationEnabled) {
      return
    }

    this.githubActionsService
      .getGithubActionSolinasVerification(githubMetadata.githubOrgName, githubMetadata.githubRepoUrl)
      .pipe(first())
      .subscribe((isSolinasAppInstalled) => {
        this.isSolinasAppInstalled.set(isSolinasAppInstalled)
      })

    try {
      const [cxOneApplication, languageFormItems, githubActionsFormItems] = await Promise.all([
        firstValueFrom(this.cxOneService.getCxOneApplication()),
        this.buildLanguageFormItems(),
        this.githubActionsFormService.buildFormItems<SetupValidationFormValue>(
          this.refreshStepsVisibility.bind(this) as () => Promise<void>,
          () => this.formStep() === 2,
        ),
      ])

      if (cxOneApplication !== null) {
        for (const formItem of this.cxOneFormItems as InputDynamicFormFieldItem[]) {
          if (formItem.name === 'cxOneApplicationName') {
            formItem.default = cxOneApplication.applicationName
          }
        }
      }

      this.formItems = this.formItems.concat(
        languageFormItems,
        this.validationToolSelectFormItems,
        this.cxOneFormItems,
        githubActionsFormItems,
        this.githubActionsDiscmlaimerFormItems,
      )
    } catch (error) {
      this.setErrorMessage(error as Error)
    }

    this.loading.set(false)
  }

  ngOnDestroy(): void {
    if (this.watchCxOneApplication$) {
      this.watchCxOneApplication$.unsubscribe()
    }
  }

  async refreshStepsVisibility(): Promise<void> {
    if (!this.formGenerator) return

    await this.formGenerator.refreshStepsVisibility()
  }

  async buildLanguageFormItems(): Promise<DynamicFormItem[]> {
    const githubLanguages = await firstValueFrom(this.githubService.getRepositoryLanguages())
    const recommendedLanguage = this.githubService.getMostUsedLanguage(githubLanguages, ProgrammingLanguages)

    const languageChoices: SelectItem<Languages>[] = ProgrammingLanguages.map((lang) => {
      let displayName = lang.displayName
      if (lang.id === recommendedLanguage.id) {
        displayName = `${displayName} (found in your repository)`
      }

      return {
        label: displayName,
        value: lang.id,
      }
    })

    return [
      {
        type: 'header',
        name: 'languageHeader',
        message: '',
        guiOptions: {
          additionalData: <FormGeneratorHeaderAdditionalData<SetupValidationFormValue>>{
            headerText: 'Select your programming language',
            ignoreTopMargin: true,
            ignoreBottomMargin: true,
          },
        },
        when: () => this.formStep() === 1,
      },
      {
        type: 'select',
        name: 'language',
        message: '',
        placeholder: 'Select',
        default: recommendedLanguage.id,
        choices: languageChoices,
        validators: [Validators.required],
        when: () => this.formStep() === 1,
        onchange: (fieldValue: Languages) => {
          this.updateCxOnePresetChoices(fieldValue)
          this.setValidationToolsValue(getRequiredValidationTools(fieldValue))
        },
      },
    ]
  }

  setErrorMessage(error: Error) {
    const errorMessage = error.message || 'Unknown error'
    this.errorMessage.set(errorMessage)
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  submit(): void {
    if (this.formStep() === 1 && !this.isSolinasAppInstalled()) {
      this.formStep.set(2)
      void this.refreshStepsVisibility()
      return
    }
    const rawFormValue = this.formGenerator.form.value as { ungrouped: SetupValidationFormValue }
    void this.submitForm(rawFormValue.ungrouped)
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  setValidationToolsValue(value: ValidationTools[]): void {
    if (!this.formGenerator) return
    const validationToolsControl = this.formGenerator.formControlItems[0].get('validationTools')
    if (value.length === 0) {
      validationToolsControl.reset()
      return
    }
    validationToolsControl.setValue(value)
  }

  updateCxOnePresetChoices(language: Languages): void {
    if (!this.formGenerator) return
    // FormGenerator doesn't dynamically update choices in `select` items,
    // we have to update them directry
    const formItems = this.formGenerator.formControlItems[0].formItem as DynamicFormFieldGroupMap
    const cxOnePresetFormItem = formItems.items.get('cxOnePreset') as SelectDynamicFormFieldItem
    cxOnePresetFormItem.choices = getCxOnePresets(language)

    const cxOnePresetControl = this.formGenerator.formControlItems[0].get('cxOnePreset')
    cxOnePresetControl.setValue(undefined)
  }

  updateCxOneApplicationName(cxOneApplicationName: string | null): void {
    if (!this.formGenerator) return

    const cxOneApplicationNameControl = this.formGenerator.formControlItems[0].get('cxOneApplicationName')
    cxOneApplicationNameControl.setValue(cxOneApplicationName)
  }

  async submitForm(formValue: SetupValidationFormValue) {
    this.loading.set(true)

    try {
      const githubMetadata = await this.githubService.getGithubMetadata()
      const { resourceRefs, labels } = await firstValueFrom(
        this.watch$.pipe(
          // Trying to get a non-null response for 5 seconds
          timeout(5000),
          skipWhile(({ resourceRefs }) => resourceRefs === null),
        ),
      )

      let orchestrator: Orchestrators | undefined = undefined
      let githubResourceNotExist = true

      if (resourceRefs) {
        resourceRefs.forEach((ref) => {
          switch (ref.kind) {
            case Kinds.GITHUB_REPOSITORY:
              githubResourceNotExist = false
              break
            case Kinds.JENKINS_PIPELINE:
              orchestrator = Orchestrators.Jenkins
              break
            case Kinds.GITHUB_ACTIONS_WORKFLOW:
            case Kinds.GITHUB_ACTION:
              orchestrator = Orchestrators.GitHubActions
              break
          }
        })
      }

      if (githubResourceNotExist) {
        await this.createGithubResource()
      }

      await firstValueFrom(
        this.githubActionsService.createGithubActions(githubMetadata.githubInstance, githubMetadata.githubOrgName),
      )

      for (const validationTool of formValue.validationTools) {
        if (validationTool === ValidationTools.CX) {
          await firstValueFrom(this.cxOneService.createCxOneProject(formValue.cxOnePreset))
        }
        if (validationTool === ValidationTools.GHAS) {
          await firstValueFrom(
            this.githubAdvancedSecurityService.createGithubAdvancedSecurity({
              codeScanJobOrchestrator: orchestrator,
              buildTool: getBuidTool(formValue.language),
              labels: labels,
            }),
          )
        }
      }

      this.luigiClient.uxManager().closeCurrentModal()
    } catch (error) {
      this.setErrorMessage(error as Error)
    } finally {
      this.loading.set(false)
    }
  }

  async createGithubResource(): Promise<void> {
    const context = await this.luigiService.getContextAsync()
    const entityContext = context.entityContext as unknown as EntityContext

    const repoUrl: string = entityContext?.component?.annotations?.['github.dxp.sap.com/repo-url'] ?? ''
    const login: string = entityContext?.component?.annotations?.['github.dxp.sap.com/login'] ?? ''
    const repoName: string = entityContext?.component?.annotations?.['github.dxp.sap.com/repo-name'] ?? ''

    const githubRepoUrl = new URL(repoUrl)

    await firstValueFrom(this.githubService.createGithubRepository(githubRepoUrl.origin, login, repoName, false))
  }

  /**
   * Creates a subscription which queries backend for CxOne application every 5 seconds
   * Query is sent only when 'No account found' message is shown
   */
  watchCxOneApplication(): Subscription {
    const queryCxOneApplicationFunc = async () => {
      try {
        const cxOneApplication = await firstValueFrom(this.cxOneService.getCxOneApplication())
        if (cxOneApplication === null) {
          this.updateCxOneApplicationName(null)
        } else {
          this.updateCxOneApplicationName(cxOneApplication.applicationName)
        }
        await this.refreshStepsVisibility()
      } catch (error) {
        this.setErrorMessage(error as Error)
      }
    }

    return interval(5000)
      .pipe(
        skipWhile(() => {
          if (!this.formGenerator) {
            return true
          }

          return !this.formGenerator.shouldShowFields['cxOneApplicationMissing']
        }),
      )
      .subscribe(() => void queryCxOneApplicationFunc())
  }
}
