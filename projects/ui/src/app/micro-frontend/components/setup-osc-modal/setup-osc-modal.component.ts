import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core'
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { FormModule, FundamentalNgxCoreModule, IllustratedMessageModule, SvgConfig } from '@fundamental-ngx/core'
import {
  DynamicFormItem,
  DynamicFormValue,
  FormGeneratorComponent,
  FormGeneratorService,
  FundamentalNgxPlatformModule,
} from '@fundamental-ngx/platform'
import { PlatformMessagePopoverModule } from '@fundamental-ngx/platform/message-popover'
import { EntityContext, SetupOSCFormValue, Pipeline } from '@types'
import { JiraProjectTypes, Kinds, OSCPlatforms } from '@enums'
import { debounceTime, firstValueFrom, Observable } from 'rxjs'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { PlatformFormGeneratorCustomHeaderElementComponent } from '../form-generator/form-generator-header/form-generator-header.component'
import { PlatformFormGeneratorCustomMessageStripComponent } from '../form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { OpenSourceComplianceService } from '../../services/open-source-compliance.service'
import { PlatformFormGeneratorCustomReadOnlyInputComponent } from '../form-generator/form-generator-read-only-input/form-generator-read-only-input.component'
import { GithubService } from '../../services/github.service'
import { ExtensionService } from '../../services/extension.service'
import { KindExtensionName } from '@constants'
import { ExtensionClass } from '../../services/extension.types'
import { PipelineService } from '../../services/pipeline.service'
import { toolsSvg } from 'projects/ui/src/assets/ts-svg/tools'

enum OSCSetupSteps {
  PREREQUISITES_INFO = 'PREREQUISITES_INFO',
  OSC_PLATFORM_FORM = 'OSC_PLATFORM_FORM',
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
  ],
})
export class SetupOSCModalComponent implements OnInit {
  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  watch$: Observable<Pipeline>

  loading = signal(true)
  errorMessage = signal('')

  formCreated = false
  formValue: DynamicFormValue
  formStep: OSCSetupSteps = OSCSetupSteps.PREREQUISITES_INFO

  isJiraIntanceConnected = true
  jiraProjects = []

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

  OSC_PREREQUISITES_LINK = 'https://pages.github.tools.sap/hyperspace/academy/services/osc/prerequisites/'

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
      default: OSCPlatforms.GITHUB,
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
        additionalData: {
          header: 'Connect your Jira project:',
          ignoreTopMargin: true,
        },
      },
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && !this.isJiraIntanceConnected
      },
    },
    {
      type: 'input',
      name: 'jiraInstance',
      message: 'Instance',
      default: () => '',
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && !this.isJiraIntanceConnected
      },
      validators: [Validators.required],
    },
    {
      type: 'input',
      name: 'jiraInstanceProjectKey',
      message: 'Project Key',
      default: () => '',
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && !this.isJiraIntanceConnected
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
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && this.isJiraIntanceConnected
      },
    },
    {
      type: 'radio',
      name: 'jiraProjectType',
      message: '',
      default: () => {
        return JiraProjectTypes.NEW
      },
      choices: [JiraProjectTypes.EXISTING, JiraProjectTypes.NEW],
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && this.isJiraIntanceConnected && this.jiraProjects.length > 0
      },
      guiOptions: {
        inline: true,
      },
      validators: [Validators.required],
    },
    {
      type: 'select',
      name: 'jiraExistingProjectKey',
      message: 'Project Key',
      default: 1,
      choices: [
        {
          label: 'Project #1',
          value: 1,
        },
        {
          label: 'Project #2',
          value: 2,
        },
      ],
      when: (formValue: SetupOSCFormValue) => {
        return (
          formValue.platform === OSCPlatforms.JIRA &&
          this.isJiraIntanceConnected &&
          formValue.jiraProjectType == JiraProjectTypes.EXISTING
        )
      },
      validators: [Validators.required],
    },
    {
      type: 'input',
      name: 'jiraNewProjectKey',
      message: 'Project Key',
      default: () => '',
      when: (formValue: SetupOSCFormValue) => {
        return (
          formValue.platform === OSCPlatforms.JIRA &&
          this.isJiraIntanceConnected &&
          formValue.jiraProjectType == JiraProjectTypes.NEW
        )
      },
      disable: true,
      validators: [Validators.required],
    },
    // Github
    {
      type: 'read-only-input',
      name: 'githubRepository',
      message: 'Repository',
      default: async () => {
        const entityContext = (await this.luigiService.getContextAsync()).entityContext as unknown as EntityContext
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
          ignoreTopMargin: false,
        },
      },
    },
    {
      type: 'input',
      name: 'ppmsSoftwareComponentVersion',
      message: 'PPMS Software Component Version',
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
    private luigiClient: LuigiClient,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomReadOnlyInputComponent, ['read-only-input'])
  }

  async ngOnInit() {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))

    const resourceRefs = (await firstValueFrom(this.watch$)).resourceRefs
    const isBuildPipelineSetup = this.pipelineService.isBuildPipelineSetup(resourceRefs)

    if (isBuildPipelineSetup) {
      this.formStep = OSCSetupSteps.OSC_PLATFORM_FORM
    }

    const extensionClasses = await firstValueFrom(this.extensionService.getExtensionClassesForScopesQuery())
    this.oscExtensionClass = extensionClasses.find(
      (extensionClass) => extensionClass.name == (KindExtensionName[Kinds.OPEN_SOURCE_COMPLIANCE] as string),
    )

    this.loading.set(false)
  }

  onFormCreated(): void {
    this.formCreated = true
  }

  async onFormSubmitted(formData: SetupOSCFormValue): Promise<void> {
    if (formData.platform === OSCPlatforms.JIRA) {
      return
    }
    return await this.createGithubOsc(formData)
  }

  async createGithubOsc(formData: SetupOSCFormValue): Promise<void> {
    this.loading.set(true)

    const githubMetadata = await this.githubService.getGithubMetadata()

    const createOpenSourceComplianceRegistrationArgs: Parameters<
      typeof this.openSourceComplianceService.createOpenSourceComplianceRegistration
    >[0] = {
      jira: undefined,
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

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  submitForm(): void {
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

  isOscPlatformFormStep(): boolean {
    return this.formStep === OSCSetupSteps.OSC_PLATFORM_FORM
  }

  moveToOscPlatformFormStep() {
    this.formStep = OSCSetupSteps.OSC_PLATFORM_FORM
  }

  async openSetupBuildModal() {
    const context = await this.luigiService.getContextAsync()
    const linkToCompoent = `${context.frameBaseUrl}/projects/${context.projectId}/components/${context.componentId}`
    const buildModalUrlParam = `%2Fprojects%2F${context.projectId}%2Fcomponents%2F${context.componentId}%2Fpipeline-ui%2Fsetup&modalParams={"size":"s","title":"Set up Build"}`
    const setupBuildModalLink = `${linkToCompoent}/pipeline-ui?modal=${buildModalUrlParam}`
    window.open(setupBuildModalLink, '_blank', 'noopoener, noreferrer')
  }
}
