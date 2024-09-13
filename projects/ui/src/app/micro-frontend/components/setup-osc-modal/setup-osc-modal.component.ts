import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import {
  FormModule,
  FundamentalNgxCoreModule,
  IllustratedMessageModule,
  MessageStripModule,
  SvgConfig,
} from '@fundamental-ngx/core'
import {
  DynamicFormItem,
  DynamicFormValue,
  FormGeneratorComponent,
  FormGeneratorService,
  FundamentalNgxPlatformModule,
} from '@fundamental-ngx/platform'
import { PlatformMessagePopoverModule } from '@fundamental-ngx/platform/message-popover'
import { EntityContext, Pipeline, SetupOSCFormValue, ValidationLanguage } from '@types'
import { JiraProjectTypes, Kinds, OSCPlatforms } from '@enums'
import { debounceTime, firstValueFrom, Observable } from 'rxjs'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { PlatformFormGeneratorCustomHeaderElementComponent } from '../form-generator/form-generator-header/form-generator-header.component'
import { PlatformFormGeneratorCustomMessageStripComponent } from '../form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { OpenSourceComplianceService } from '../../services/open-source-compliance.service'
import { PlatformFormGeneratorCustomReadOnlyInputComponent } from '../form-generator/form-generator-read-only-input/form-generator-read-only-input.component'
import { GithubService } from '../../services/github.service'
import { ExtensionService } from '../../services/extension.service'
import { KindExtensionName, ValidationLanguages } from '@constants'
import { ExtensionClass } from '../../services/extension.types'
import { PipelineService } from '../../services/pipeline.service'
import { toolsSvg } from 'projects/ui/src/assets/ts-svg/tools'
import { JiraService } from '../../services/jira.service'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../form-generator/form-generator-info-box/form-generator-info-box.component'
import { DxpContext } from '@dxp/ngx-core/common'
import { JiraProject } from '@generated/graphql'

enum OSCSetupSteps {
  PREREQUISITES_INFO = 'PREREQUISITES_INFO',
  PREREQUISITES_SETUP = 'PREREQUISITES_SETUP',
  OSC_PLATFORM_FORM = 'OSC_PLATFORM_FORM',
}

const ModalSettingsBySetupStep = {
  [OSCSetupSteps.PREREQUISITES_INFO]: {
    height: '410px',
    width: '600px',
  },
  [OSCSetupSteps.PREREQUISITES_SETUP]: {
    height: '780px',
    width: '600px',
  },
  [OSCSetupSteps.OSC_PLATFORM_FORM]: {
    height: '780px',
    width: '600px',
  },
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-setup-osc',
  templateUrl: './setup-osc-modal.component.html',
  styleUrl: './setup-osc-modal.component.css',
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    FormModule,
    FormsModule,
    ReactiveFormsModule,
    FundamentalNgxPlatformModule,
    ErrorMessageComponent,
    PlatformMessagePopoverModule,
    IllustratedMessageModule,
    MessageStripModule,
  ],
})
export class SetupOSCModalComponent implements OnInit {
  @ViewChild('formGenerator') formGenerator: FormGeneratorComponent
  watch$: Observable<Pipeline>

  jiraProjects = signal<JiraProject[]>([])
  prerequisitesRecommendedLanguage = signal({} as ValidationLanguage)
  prerequisitesAvailableLanguages = signal([])
  prerequisitesXmakeChoices = signal(['Yes', 'No'])
  context = signal({} as DxpContext)
  isBuildPipelineSetup = signal(false)

  setupPrerequisitesFormGroup = new FormGroup({
    languageSelection: new FormControl(null as ValidationLanguage, Validators.required),
    xMakeOption: new FormControl(null, Validators.required),
  })

  loading = signal(true)
  errorMessage = signal('')
  formCreated = false
  formValue: DynamicFormValue
  formStep: OSCSetupSteps = OSCSetupSteps.PREREQUISITES_INFO

  isJiraInstanceConnected = true

  prerequisitesStepIconConfig: SvgConfig = {
    spot: {
      file: toolsSvg,
      id: 'tools',
    },
  }

  oscExtensionClass: ExtensionClass = {
    name: '',
    displayName: '',
  }

  questions: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'platformSelectionHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Select where to report issues',
        },
      },
    },
    {
      type: 'radio',
      name: 'platform',
      message: '',
      default: OSCPlatforms.JIRA,
      choices: [
        {
          label: 'Jira (recommended)',
          value: OSCPlatforms.JIRA,
        },
        {
          label: 'GitHub',
          value: OSCPlatforms.GITHUB,
        },
      ],
      validators: [Validators.required],
    },
    {
      // a hacky way of adding a padding to 'platform' radio-buttons above
      type: 'header',
      name: 'platformBottomPadding',
      message: '',
      guiOptions: {
        additionalData: {
          // 'header' component has top and bottom margins, 1rem (16px) each.
          // Ignore the top maring to set height at 1rem (16px)
          ignoreTopMargin: true,
        },
      },
    },
    // Jira - Instance
    {
      type: 'header',
      name: 'jiraNewInstanceHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Connect your Jira project:',
          ignoreTopMargin: true,
        },
      },
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && !this.isJiraInstanceConnected
      },
    },
    {
      type: 'input',
      name: 'jiraInstance',
      message: 'Instance',
      default: () => '',
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && !this.isJiraInstanceConnected
      },
      validators: [Validators.required],
    },
    {
      type: 'input',
      name: 'jiraInstanceProjectKey',
      message: 'Project Key',
      default: () => '',
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && !this.isJiraInstanceConnected
      },
      validators: [Validators.required],
    },
    // Jira - Project
    {
      type: 'header',
      name: 'jiraExistingProjectHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Select your Jira project:',
          ignoreTopMargin: true,
        },
      },
      when: (formValue: SetupOSCFormValue) =>
        formValue.platform === OSCPlatforms.JIRA && this.isJiraInstanceConnected && this.jiraProjects().length > 0,
    },
    {
      type: 'radio',
      name: 'jiraProjectType',
      message: '',
      default: () => (this.jiraProjects().length > 0 ? JiraProjectTypes.EXISTING : JiraProjectTypes.NEW),
      choices: [JiraProjectTypes.EXISTING, JiraProjectTypes.NEW],
      when: (formValue: SetupOSCFormValue) =>
        formValue.platform === OSCPlatforms.JIRA && this.isJiraInstanceConnected && this.jiraProjects().length > 0,
      guiOptions: {
        inline: true,
      },
      validators: [Validators.required],
    },
    {
      type: 'info',
      name: 'jiraAddNewProjectInstructions',
      message: '',
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && formValue.jiraProjectType === JiraProjectTypes.NEW
      },
      guiOptions: {
        additionalData: {
          header: 'Add Jira project',
          callBeforeRefresh: async () => await this.createMoveToOSCPlatformForm(),
          showRefreshButton: true,
          // eslint-disable-next-line @typescript-eslint/require-await
          instructions: async () => {
            return `<ol>   
              <li>Install the Hyperspace Portal Jira extension from the              
              <a href='${this.context().frameBaseUrl}/projects/${this.context().projectId}/catalog?modal=%2Fprojects%2F${this.context().projectId}%2Finstall-extensions&modalParams=%7B%22title%22%3A%22Install%20Extensions%22%2C%22size%22%3A%22fullscreen%22%7D', target="_blank"> 
                catalog.</a>
              </li>
              
              <li><a href='${this.context().frameBaseUrl}/projects/${this.context().projectId}/catalog?~extClassName=jira&~layout=TwoColumnsMidExpanded&modal=%2Fprojects%2F${this.context().projectId}%2Fcatalog%2Fcreate-res%2Fglobal%2Fjira%2Faccount%2Fjira-tools%3F~type%3Djira-tools&modalParams=%7B%22title%22%3A%22Create%20an%20account%22%2C%22size%22%3A%22s%22%7D', target="_blank"> 
                 Create an account
              </a> and fill in your Jira project configuration details.
              </li>

             <li> Click the <i>Refresh</i> button below.</li>
          </ol>`
          },
        },
      },
    },
    {
      type: 'header',
      name: 'padding-before-jiraExistingProjectKey',
      message: '',
      guiOptions: {
        additionalData: {
          // 'header' component has top and bottom margins, 1rem (16px) each.
          // Ignore the top maring to set height at 1rem (16px)
          ignoreTopMargin: true,
        },
      },
      when: (formValue: SetupOSCFormValue) => {
        return (
          formValue.platform === OSCPlatforms.JIRA &&
          this.isJiraInstanceConnected &&
          formValue.jiraProjectType === JiraProjectTypes.EXISTING
        )
      },
    },
    {
      type: 'select',
      name: 'jiraExistingProjectKey',
      placeholder: 'Select',
      default: () => (this.jiraProjects().length === 1 ? this.jiraProjects()[0].projectKey : undefined),
      message: 'Project Key',
      choices: () => this.jiraProjects().map((project) => project.projectKey),
      guiOptions: {
        inline: false,
      },
      when: (formValue: SetupOSCFormValue) => {
        return (
          formValue.platform === OSCPlatforms.JIRA &&
          this.isJiraInstanceConnected &&
          formValue.jiraProjectType === JiraProjectTypes.EXISTING
        )
      },
      validators: [Validators.required],
    },
    {
      type: 'header',
      name: 'padding-after-jiraExistingProjectKey',
      message: '',
      guiOptions: {
        additionalData: {
          ignoreTopMargin: true,
        },
      },
      when: (formValue: SetupOSCFormValue) => {
        return (
          formValue.platform === OSCPlatforms.JIRA &&
          this.isJiraInstanceConnected &&
          formValue.jiraProjectType === JiraProjectTypes.EXISTING
        )
      },
    },
    {
      type: 'header',
      name: 'padding-after-Jira-Section',
      message: '',
      guiOptions: {
        additionalData: {
          ignoreTopMargin: true,
        },
      },
    },
    // Github
    {
      type: 'read-only-input',
      name: 'githubRepository',
      message: 'Repository',
      default: () => {
        const entityContext = this.context().entityContext as unknown as EntityContext
        const githubRepoName = entityContext.component?.annotations?.['github.dxp.sap.com/repo-name'] ?? ''
        return `${githubRepoName} (component repository)`
      },
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.GITHUB
      },
      validators: [Validators.required],
    },
    // PPMS Software Component Version
    {
      type: 'header',
      name: 'trackComplianceHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Track compliance',
        },
      },
    },
    {
      type: 'input',
      name: 'ppmsSoftwareComponentVersion',
      message: 'PPMS Software Component Version',
      placeholder: ' ',
    },
    {
      type: 'message-strip',
      name: 'ppmsScvInfoMessageStrip',
      message: '',
      guiOptions: {
        additionalData: {
          type: 'information',
          addMargins: true,
          message: () => {
            return `Fill this PPMS info to be compliant. This is needed if you've released or plan to release this component to customers.`
          },
        },
      },
    },
  ]

  constructor(
    private readonly luigiService: DxpLuigiContextService,
    private readonly _formGeneratorService: FormGeneratorService,
    private readonly extensionService: ExtensionService,
    private readonly pipelineService: PipelineService,
    private readonly githubService: GithubService,
    private readonly openSourceComplianceService: OpenSourceComplianceService,
    private readonly jiraService: JiraService,
    private luigiClient: LuigiClient,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomReadOnlyInputComponent, ['read-only-input'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
  }

  async ngOnInit() {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    const resourceRefs = (await firstValueFrom(this.watch$)).resourceRefs
    this.isBuildPipelineSetup.set(this.pipelineService.isBuildPipelineSetup(resourceRefs))
    this.jiraProjects.set(await firstValueFrom(this.jiraService.getJiraItems()))

    this.context.set(await this.luigiService.getContextAsync())
    const isRefreshPress = (await this.luigiClient
      .storageManager()
      .getItem(`${this.context().projectId}-${this.context().componentId}-move-to-OSC_PLATFORM_FORM`)) as boolean

    await this.fetchLanguages()
    this.setupPrerequisitesFormGroup.controls.languageSelection.patchValue(this.prerequisitesRecommendedLanguage())
    await this.moveTo(isRefreshPress, this.isBuildPipelineSetup())

    const extensionClasses = await firstValueFrom(this.extensionService.getExtensionClassesForScopesQuery())
    this.oscExtensionClass = extensionClasses.find(
      (extensionClass) => extensionClass.name == (KindExtensionName[Kinds.OPEN_SOURCE_COMPLIANCE] as string),
    )

    this.loading.set(false)
  }

  private async moveTo(isRefreshPress: boolean, isBuildPipelineSetup: boolean) {
    if (isRefreshPress) {
      await this.luigiClient
        .storageManager()
        .removeItem(`${this.context().projectId}-${this.context().componentId}-move-to-OSC_PLATFORM_FORM`)
      this.moveToOscPlatformFormStep()
    } else if (isBuildPipelineSetup) {
      this.moveToOscPrerequisitesSetupStep()
      this.setupPrerequisitesFormGroup.removeControl('xMakeOption')
    }
  }

  async fetchLanguages() {
    const entityContext = this.context().entityContext as unknown as EntityContext
    const repoUrl = entityContext?.component?.annotations['github.dxp.sap.com/repo-url'] ?? null

    let gitRepoLanguages: Record<string, number>
    try {
      gitRepoLanguages = await this.githubService.getRepositoryLanguages(this.luigiClient, this.luigiService, repoUrl)
    } catch (error) {
      this.errorMessage.set((error as Error).message)
    }

    const languagesMap = new Map(Object.entries(gitRepoLanguages))
    // convert map into array of pairs : [ [key, value] , ... ] and take whatever key is found the most so [0]
    const foundLanguage = Array.from(languagesMap.entries()).reduce(
      (prevEntry, nextEntry) => (prevEntry[1] > nextEntry[1] ? prevEntry : nextEntry),
      0,
    )[0] as string

    // If there is no language found in the GH repo, use "other". Otherwise use whatever we find in GH.
    this.prerequisitesRecommendedLanguage.set(ValidationLanguages.find((lang) => lang.id === 'other'))
    ValidationLanguages.forEach((language) => {
      if (language.githubLinguistNames.includes(foundLanguage)) {
        this.prerequisitesRecommendedLanguage.set(language)
      }
    })

    this.prerequisitesAvailableLanguages.set(ValidationLanguages)
  }

  onFormCreated(): void {
    this.formCreated = true
  }

  async onFormSubmitted(formData: SetupOSCFormValue): Promise<void> {
    this.loading.set(true)
    let jiraProject: JiraProject = null

    if (formData.platform === OSCPlatforms.JIRA) {
      jiraProject = this.jiraProjects().find((project) => project.projectKey === formData.jiraExistingProjectKey)

      if (!jiraProject?.resourceName) {
        this.errorMessage.set('Resource name of selected Jira project not found')
        return
      }
    }

    const githubMetadata = await this.githubService.getGithubMetadata()

    const createOpenSourceComplianceRegistrationArgs: Parameters<
      typeof this.openSourceComplianceService.createOpenSourceComplianceRegistration
    >[0] = {
      jira: jiraProject ? jiraProject.resourceName : undefined,
      ppmsScv: formData.ppmsSoftwareComponentVersion,
      githubBaseUrl: githubMetadata.githubInstance,
      githubOrg: githubMetadata.githubOrgName,
      githubRepo: githubMetadata.githubRepoName,
      githubSecretPath: '',
      isGithubActionsGPP: false,
    }

    await firstValueFrom(
      this.openSourceComplianceService.createOpenSourceComplianceRegistration(
        createOpenSourceComplianceRegistrationArgs,
      ),
    )
      .then(() => {
        this.luigiClient.uxManager().closeCurrentModal()
      })
      .catch((error) => {
        const errorMessage = (error as Error).message
        this.errorMessage.set(errorMessage)
      })
      .finally(() => {
        this.loading.set(false)
      })
  }

  isSubmitButtonDisabled() {
    if (!this.formGenerator || !this.formGenerator.formFields) {
      return false
    }

    const formFields = this.formGenerator.formFields

    const selectedOSCPlatform = formFields.find((field) => field.id === 'platform')?.value as OSCPlatforms
    if (selectedOSCPlatform === OSCPlatforms.GITHUB) {
      return false
    }

    const projectKeySelectedValue = formFields.find((field) => field.id === 'jiraExistingProjectKey')
    if (!projectKeySelectedValue) {
      return true
    }

    const jiraProjectTypeChosenType = formFields.find((field) => field.id === 'jiraProjectType')
      ?.value as JiraProjectTypes
    if (jiraProjectTypeChosenType !== JiraProjectTypes.EXISTING) {
      return true
    }

    return false
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  submitPrerequisitesForm(): void {
    this.moveToOscPlatformFormStep()
  }

  submitForm() {
    this.formGenerator.submit()
  }

  getIcon(): string {
    if (this.oscExtensionClass.name) {
      return this.extensionService.getIcon(this.oscExtensionClass)
    }
    return ''
  }

  isPrerequisitesInfoStep(): boolean {
    return this.formStep === OSCSetupSteps.PREREQUISITES_INFO
  }

  isPrerequisitesSetupStep(): boolean {
    return this.formStep === OSCSetupSteps.PREREQUISITES_SETUP
  }

  isOscPlatformFormStep(): boolean {
    return this.formStep === OSCSetupSteps.OSC_PLATFORM_FORM
  }

  isXmakeSelected(): boolean {
    return this.setupPrerequisitesFormGroup.controls.xMakeOption?.value == 'Yes'
  }

  isLanguageUnsupported(): boolean {
    const languageSelected = this.setupPrerequisitesFormGroup.controls.languageSelection.value.id
    return languageSelected == 'python' || languageSelected == 'golang'
  }

  moveToOscPrerequisitesSetupStep() {
    this.formStep = OSCSetupSteps.PREREQUISITES_SETUP
    this.luigiClient.linkManager().updateModalSettings(ModalSettingsBySetupStep[OSCSetupSteps.PREREQUISITES_SETUP])
  }

  moveToOscPlatformFormStep() {
    this.formStep = OSCSetupSteps.OSC_PLATFORM_FORM
    this.luigiClient.linkManager().updateModalSettings(ModalSettingsBySetupStep[OSCSetupSteps.OSC_PLATFORM_FORM])
  }

  openSetupBuildModal() {
    const linkToCompoent = `${this.context().frameBaseUrl}/projects/${this.context().projectId}/components/${this.context().componentId}`
    const buildModalUrlParam = `%2Fprojects%2F${this.context().projectId}%2Fcomponents%2F${this.context().componentId}%2Fpipeline-ui%2Fsetup&modalParams={"size":"s","title":"Set up Build"}`
    const setupBuildModalLink = `${linkToCompoent}/pipeline-ui?modal=${buildModalUrlParam}`
    window.open(setupBuildModalLink, '_blank', 'noopener, noreferrer')
  }

  openBlackDuck() {
    const url = 'https://wiki.one.int.sap/wiki/x/CQIwi'
    window.open(url, '_blank')
  }

  async createMoveToOSCPlatformForm() {
    await this.luigiClient
      .storageManager()
      .setItem(`${this.context().projectId}-${this.context().componentId}-move-to-OSC_PLATFORM_FORM`, true)
  }
}
