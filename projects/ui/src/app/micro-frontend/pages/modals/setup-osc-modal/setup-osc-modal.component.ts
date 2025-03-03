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
import { EntityContext, Pipeline, SetupOSCFormValue, ProgrammingLanguage } from '@types'
import { JiraProjectTypes, Kinds, Languages, OSCPlatforms, StepKey } from '@enums'
import { debounceTime, firstValueFrom, Observable } from 'rxjs'
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component'
import {
  FormGeneratorHeaderAdditionalData,
  PlatformFormGeneratorCustomHeaderElementComponent,
} from '../../../components/form-generator/form-generator-header/form-generator-header.component'
import { PlatformFormGeneratorCustomMessageStripComponent } from '../../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { OpenSourceComplianceService } from '../../../services/open-source-compliance.service'
import { PlatformFormGeneratorCustomReadOnlyInputComponent } from '../../../components/form-generator/form-generator-read-only-input/form-generator-read-only-input.component'
import { GithubService } from '../../../services/github.service'
import { ExtensionService } from '../../../services/extension.service'
import { KindExtensionName, ProgrammingLanguages } from '@constants'
import { ExtensionClass } from '../../../services/extension.types'
import { PipelineService } from '../../../services/pipeline.service'
import { toolsSvg } from 'projects/ui/src/assets/ts-svg/tools'
import { JiraService } from '../../../services/jira.service'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../../../components/form-generator/form-generator-info-box/form-generator-info-box.component'
import { DxpContext } from '@dxp/ngx-core/common'
import { JiraProject, NotManagedServices, PpmsFoss } from '@generated/graphql'
import { GithubActionsService } from '../../../services/github-actions.service'

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
  watchNotManagedServices$: Observable<NotManagedServices>

  jiraProjects = signal<JiraProject[]>([])
  prerequisitesRecommendedLanguage = signal({} as ProgrammingLanguage)
  prerequisitesAvailableLanguages = signal([])
  prerequisitesXmakeChoices = signal(['Yes', 'No'])
  context = signal({} as DxpContext)
  isBuildPipelineSetup = signal(false)
  isxMakePresent = signal(false)
  ppmsFossData = signal(null as PpmsFoss)

  setupPrerequisitesFormGroup = new FormGroup({
    languageSelection: new FormControl(null as ProgrammingLanguage, Validators.required),
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
        additionalData: <FormGeneratorHeaderAdditionalData>{
          headerText: 'Select where to report issues',
          ignoreTopMargin: true,
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
    // Jira - Instance
    {
      type: 'header',
      name: 'jiraNewInstanceHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData>{
          headerText: 'Connect your Jira project:',
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
        additionalData: <FormGeneratorHeaderAdditionalData>{
          headerText: 'Select your Jira project:',
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
              <li><a href='${this.context().frameBaseUrl}/projects/${this.context().projectId}/jira?modal=%2Fprojects%2F${this.context().projectId}%2Fcatalog%2Fcreate-res%2Fglobal%2Fjira%2Fjira-tools%3F~type%3Djira-tools&modalParams=%7B%22title%22%3A%22Add%22%2C%22size%22%3A%22s%22%7D', target="_blank">
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
      type: 'message-strip',
      name: 'jiraOscUserInfoMessageStrip',
      message: '',
      guiOptions: {
        additionalData: {
          type: 'information',
          addMargins: true,
          message: () => {
            return `To report issues in your Jira project, add user T_HYPERSPACE-ACT to it with a role that has the permissions to Browse Projects and Browse/Create/Edit/Close Issues.
            Refer to <a
                  href="https://wiki.one.int.sap/wiki/x/UE2pmw"
                  target="_blank"
                  rel="noopener noreferrer">
                  staff a JIRA project
                </a>
            and <a
                  href="https://wiki.one.int.sap/wiki/x/L1dclQ"
                  target="_blank"
                  rel="noopener noreferrer">
                  JIRA permissions
                </a>
            for further details.`
          },
        },
      },
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && this.isJiraInstanceConnected
      },
    },
    // Github
    {
      type: 'header',
      name: 'githubRepositorySpacer',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData>{
          headerText: '',
          ignoreBottomMargin: true,
        },
      },
    },
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
        additionalData: <FormGeneratorHeaderAdditionalData>{
          headerText: 'Track compliance',
          doubleTopMargin: true,
        },
      },
    },
    {
      type: 'input',
      name: 'ppmsSoftwareComponentVersion',
      message: 'PPMS Software Component Version',
      placeholder: ' ',
      default: () => (this.ppmsFossData() ? this.ppmsFossData().scvId : ''),
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
    private readonly ghaService: GithubActionsService,
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
    const watchNotManagedServices$ = this.pipelineService
      .watchNotManagedServicesInPipeline()
      .pipe(debounceTime(50)) as Observable<NotManagedServices>

    const watchPipeline$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    const watchGHAE$ = this.ghaService.watchGithubActionsEnablement().pipe(debounceTime(50))

    this.watch$ = this.pipelineService.combinePipelineWithNotManagedServicesAndGithubWatch(
      watchPipeline$,
      watchNotManagedServices$,
      watchGHAE$,
    )

    const resourceRefs = (await firstValueFrom(this.watch$)).resourceRefs
    this.isxMakePresent.set(resourceRefs.some((ref) => ref.kind === StepKey.XMAKE))
    if (this.isxMakePresent()) this.setupPrerequisitesFormGroup.controls.xMakeOption.setValue('Yes')

    this.isBuildPipelineSetup.set(this.pipelineService.isBuildPipelineSetup(resourceRefs))
    this.jiraProjects.set(await firstValueFrom(this.jiraService.getJiraProjects()))
    this.ppmsFossData.set((await firstValueFrom(this.watch$)).notManagedServices?.ppmsFoss)

    this.context.set(await this.luigiService.getContextAsync())
    const isRefreshPress = (await this.luigiClient
      .storageManager()
      .getItem(`${this.context().projectId}-${this.context().componentId}-move-to-OSC_PLATFORM_FORM`)) as boolean

    await this.recommendLanguage()
    this.setupPrerequisitesFormGroup.controls.languageSelection.patchValue(this.prerequisitesRecommendedLanguage())
    await this.moveToNextStep(isRefreshPress, this.isBuildPipelineSetup(), this.isxMakePresent())

    const extensionClasses = await firstValueFrom(this.extensionService.getExtensionClassesForScopesQuery())
    this.oscExtensionClass = extensionClasses.find(
      (extensionClass) => extensionClass.name == (KindExtensionName[Kinds.OPEN_SOURCE_COMPLIANCE] as string),
    )

    this.loading.set(false)
  }

  private async moveToNextStep(isRefreshPress: boolean, isBuildPipelineSetup: boolean, isXmakePresent: boolean) {
    if (isRefreshPress) {
      await this.luigiClient
        .storageManager()
        .removeItem(`${this.context().projectId}-${this.context().componentId}-move-to-OSC_PLATFORM_FORM`)
      this.moveToOscPlatformFormStep()
    } else if (isBuildPipelineSetup) {
      this.moveToOscPrerequisitesSetupStep()
      if (!isXmakePresent) {
        this.setupPrerequisitesFormGroup.removeControl('xMakeOption')
      }
    }
  }

  async recommendLanguage() {
    const githubLanguages = await firstValueFrom(this.githubService.getRepositoryLanguages())
    const recommendedLanguage = this.githubService.getMostUsedLanguage(githubLanguages, ProgrammingLanguages)
    this.prerequisitesRecommendedLanguage.set(recommendedLanguage)
    this.prerequisitesAvailableLanguages.set(ProgrammingLanguages)
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
    return languageSelected == Languages.PYTHON || languageSelected == Languages.GO
  }

  moveToOscPrerequisitesSetupStep() {
    this.formStep = OSCSetupSteps.PREREQUISITES_SETUP
    this.luigiClient.linkManager().updateModalSettings(ModalSettingsBySetupStep[OSCSetupSteps.PREREQUISITES_SETUP])
  }

  moveToOscPlatformFormStep() {
    this.formStep = OSCSetupSteps.OSC_PLATFORM_FORM
    this.luigiClient.linkManager().updateModalSettings(ModalSettingsBySetupStep[OSCSetupSteps.OSC_PLATFORM_FORM])
  }

  async openSetupBuildModal() {
    await this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('setup', {
      title: 'Set up Build Pipeline',
      width: '27rem',
      height: '33rem',
    })
  }

  openBlackDuck() {
    const url = 'https://wiki.one.int.sap/wiki/x/CQIwi'
    window.open(url, '_blank', 'noopener')
  }

  async createMoveToOSCPlatformForm() {
    await this.luigiClient
      .storageManager()
      .setItem(`${this.context().projectId}-${this.context().componentId}-move-to-OSC_PLATFORM_FORM`, true)
  }
}
