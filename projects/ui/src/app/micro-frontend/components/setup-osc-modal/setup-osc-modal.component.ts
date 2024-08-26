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
import { EntityContext, Pipeline, SetupOSCFormValue } from '@types'
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
import { JiraService } from '../../services/jira.service'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../form-generator/form-generator-info-box/form-generator-info-box.component'

enum OSCSetupSteps {
  PREREQUISITES_INFO = 'PREREQUISITES_INFO',
  OSC_PLATFORM_FORM = 'OSC_PLATFORM_FORM',
}

const ModalSettingsBySetupStep = {
  [OSCSetupSteps.PREREQUISITES_INFO]: {
    height: '410px',
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
      when: (formValue: SetupOSCFormValue) => {
        return formValue.platform === OSCPlatforms.JIRA && this.isJiraInstanceConnected
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
        return formValue.platform === OSCPlatforms.JIRA && this.isJiraInstanceConnected
      },
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
          header: 'Instructions',
          instructions: async () => {
            const context = await this.luigiService.getContextAsync()
            return `<ol>   
         
              <li>Install the Hyperspace Portal Jira extension from the              
              <a href='https://portal.d1.hyperspace.tools.sap/projects/${context.projectId}/catalog?modal=%2Fprojects%2F${context.projectId}%2Finstall-extensions&modalParams=%7B%22title%22%3A%22Install%20Extensions%22%2C%22size%22%3A%22fullscreen%22%7D', target="_blank"> 
                catalog.</a>
              </li>
              
              <li><a href='https://portal.d1.hyperspace.tools.sap/projects/jenkins-tests-ghas/catalog?~extClassName=jira&~layout=TwoColumnsMidExpanded&modal=%2Fprojects%2Fjenkins-tests-ghas%2Fcatalog%2Fcreate-res%2Fglobal%2Fjira%2Faccount%2Fjira-tools%3F~type%3Djira-tools&modalParams=%7B%22title%22%3A%22Create%20an%20account%22%2C%22size%22%3A%22s%22%7D', target="_blank"> 
                 Create an account
              </a> and fill in your Jira project configuration details.
              </li>

             <li> Choose <i>Use Existing</i> and select your project key.</li>
          </ol>`
          },
        },
      },
    },
    {
      type: 'select',
      name: 'jiraExistingProjectKey',
      message: 'Select project key',
      choices: async () => {
        return (await firstValueFrom(this.jiraService.getJiraItems())).map((jiraProject) => jiraProject.projectKey)
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
    const isBuildPipelineSetup = this.pipelineService.isBuildPipelineSetup(resourceRefs)

    if (isBuildPipelineSetup) {
      this.moveToOscPlatformFormStep()
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
    this.luigiClient.linkManager().updateModalSettings(ModalSettingsBySetupStep[OSCSetupSteps.OSC_PLATFORM_FORM])
  }

  async openSetupBuildModal() {
    const context = await this.luigiService.getContextAsync()
    const linkToCompoent = `${context.frameBaseUrl}/projects/${context.projectId}/components/${context.componentId}`
    const buildModalUrlParam = `%2Fprojects%2F${context.projectId}%2Fcomponents%2F${context.componentId}%2Fpipeline-ui%2Fsetup&modalParams={"size":"s","title":"Set up Build"}`
    const setupBuildModalLink = `${linkToCompoent}/pipeline-ui?modal=${buildModalUrlParam}`
    window.open(setupBuildModalLink, '_blank', 'noopoener, noreferrer')
  }
}
