import { NgIf } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
} from '@angular/core'
import { ColorAccent, FlexibleColumnLayout, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { CategoryConfig, Pipeline, ResourceRef } from '@types'
import { Categories, Kinds, ServiceStatus, Stages, StepKey } from '@enums'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { KindCategory, KindName, OrderedStepsByCategory } from '@constants'
import { CategorySlotComponent } from '../category-slot/category-slot.component'
import { PolicyService } from '../../services/policy.service'
import { firstValueFrom } from 'rxjs'
import { OpenSourceComplianceService } from '../../services/open-source-compliance.service'
import { CategorySlotConfigService } from '../../services/category-slot-config.service'

@Component({
  selector: 'app-validate-code-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FundamentalNgxCoreModule, NgIf, CategorySlotComponent],
  templateUrl: './validate-code-section.component.html',
  styleUrl: './validate-code-section.component.css',
})
export class ValidateCodeSectionComponent implements OnChanges, OnInit {
  isValidationStageOpen = signal<boolean>(false)
  isActionRequired = signal<boolean>(false)
  pipelineStepsByCategory = new Map<Categories, ResourceRef[]>()
  @Input() pipeline: Pipeline
  @Input() localLayout: FlexibleColumnLayout
  @Output() readonly detailsOpened = new EventEmitter<Categories>()
  categoryMap: { [key: string]: CategoryConfig }
  stages = Stages
  protected readonly Categories = Categories

  constructor(
    private readonly luigiClient: LuigiClient,
    private readonly policyService: PolicyService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly openSourceComplianceService: OpenSourceComplianceService,
  ) {}

  async ngOnChanges() {
    this.pipelineStepsByCategory.set(
      Categories.STATIC_SECURITY_CHECKS,
      this.pipeline.resourceRefs.filter((ref) => KindCategory[ref.kind] === Categories.STATIC_SECURITY_CHECKS),
    )
    this.pipelineStepsByCategory.set(
      Categories.STATIC_CODE_CHECKS,
      this.pipeline.resourceRefs.filter((ref) => KindCategory[ref.kind] === Categories.STATIC_CODE_CHECKS),
    )
    this.pipelineStepsByCategory.set(
      Categories.OPEN_SOURCE_CHECKS,
      this.pipeline.resourceRefs.filter((ref) => KindCategory[ref.kind] === Categories.OPEN_SOURCE_CHECKS),
    )

    // Action Required when Checkmarx or Fortify is the only Static Security Check
    if (this.pipelineStepsByCategory.get(Categories.STATIC_SECURITY_CHECKS).length) {
      this.isActionRequired.set(
        this.pipelineStepsByCategory
          .get(Categories.STATIC_SECURITY_CHECKS)
          .every((ref) => ref.kind === StepKey.FORTIFY || ref.kind === StepKey.CHECKMARX),
      )
    }

    this.categoryMap = {
      [Categories.STATIC_SECURITY_CHECKS]: {
        configuredServicesText: this.generateConfiguredServicesText(Categories.STATIC_SECURITY_CHECKS),
        buttonConfig: {
          isButtonShown: await this.isButtonShown(Categories.STATIC_SECURITY_CHECKS),
          buttonText: 'Add',
          buttonAction: async (e) => this.openSetupDialog(e, Categories.STATIC_SECURITY_CHECKS),
          buttonTestId: 'add-static-security-checks-button',
          buttonType: this.isActionRequired() ? 'emphasized' : null,
        },
        statusTagConfig: await this.generateStatusTag(Categories.STATIC_SECURITY_CHECKS),
        statusIconConfig: this.getStatusIconConfig(Categories.STATIC_SECURITY_CHECKS),
        isOpenArrowShown: this.isCategoryConfigured(Categories.STATIC_SECURITY_CHECKS),
        rightSideTextConfig: this.generateRightSideConfig(
          Categories.STATIC_SECURITY_CHECKS,
          this.pipelineStepsByCategory.get(Categories.STATIC_SECURITY_CHECKS),
        ),
        infoIconConfig: {
          isIconShown: this.pipelineStepsByCategory.get(Categories.STATIC_SECURITY_CHECKS).length === 0,
          iconInlineHelpText: 'Configure Static Security services like GitHub Advanced Security and CxONE',
        },
      },
      [Categories.STATIC_CODE_CHECKS]: {
        configuredServicesText: this.generateConfiguredServicesText(Categories.STATIC_CODE_CHECKS),
        buttonConfig: {
          isButtonShown: await this.isButtonShown(Categories.STATIC_CODE_CHECKS),
          buttonText: 'Add',
          buttonAction: async (e: Event) => this.openSetupDialog(e, Categories.STATIC_CODE_CHECKS),
          buttonTestId: 'add-static-code-checks-button',
        },
        statusTagConfig: await this.generateStatusTag(Categories.STATIC_CODE_CHECKS),
        infoIconConfig: {
          isIconShown: this.pipelineStepsByCategory.get(Categories.STATIC_CODE_CHECKS).length === 0,
          iconInlineHelpText: 'Configure Static Code Check services like SonarQube',
        },
        statusIconConfig: this.getStatusIconConfig(Categories.STATIC_CODE_CHECKS),
        rightSideTextConfig: {
          rightSideText: !this.isCategoryConfigured(Categories.STATIC_CODE_CHECKS) ? 'Coming soon' : null,
        },
        isOpenArrowShown: this.isCategoryConfigured(Categories.STATIC_CODE_CHECKS),
      },
      [Categories.OPEN_SOURCE_CHECKS]: {
        configuredServicesText: this.generateConfiguredServicesText(Categories.OPEN_SOURCE_CHECKS),
        buttonConfig: {
          isButtonShown: await this.isButtonShown(Categories.OPEN_SOURCE_CHECKS),
          buttonText: 'Add',
          buttonAction: async (e: Event) => this.openSetupDialog(e, Categories.OPEN_SOURCE_CHECKS),
          buttonTestId: 'add-open-source-checks-button',
        },
        statusTagConfig: await this.generateStatusTag(Categories.OPEN_SOURCE_CHECKS),
        rightSideTextConfig: this.generateRightSideConfig(
          Categories.OPEN_SOURCE_CHECKS,
          this.pipelineStepsByCategory.get(Categories.OPEN_SOURCE_CHECKS),
        ),
        statusIconConfig: this.getStatusIconConfig(Categories.OPEN_SOURCE_CHECKS),
        infoIconConfig: {
          isIconShown: this.pipelineStepsByCategory.get(Categories.OPEN_SOURCE_CHECKS).length === 0,
          iconInlineHelpText: 'Configure the new Open-Source Compliance Service',
        },
        isOpenArrowShown: this.isCategoryConfigured(Categories.OPEN_SOURCE_CHECKS),
      },
    }
    // Needed to trigger a change detection after the map is updated.
    this.changeDetectorRef.detectChanges()
  }

  ngOnInit() {
    this.pipelineStepsByCategory.set(
      Categories.STATIC_SECURITY_CHECKS,
      this.pipeline.resourceRefs.filter((ref) => KindCategory[ref.kind] === Categories.STATIC_SECURITY_CHECKS),
    )
    this.pipelineStepsByCategory.set(
      Categories.STATIC_CODE_CHECKS,
      this.pipeline.resourceRefs.filter((ref) => KindCategory[ref.kind] === Categories.STATIC_CODE_CHECKS),
    )
    this.pipelineStepsByCategory.set(
      Categories.OPEN_SOURCE_CHECKS,
      this.pipeline.resourceRefs.filter((ref) => KindCategory[ref.kind] === Categories.OPEN_SOURCE_CHECKS),
    )
  }

  async openSetupDialog(e: Event, category: Categories) {
    e.stopPropagation()
    switch (category) {
      case Categories.STATIC_SECURITY_CHECKS:
        await this.luigiClient
          .linkManager()
          .fromVirtualTreeRoot()
          .openAsModal('setup-validation', { title: 'Add Static Security Checks', width: '600px', height: '780px' })
        break
      case Categories.OPEN_SOURCE_CHECKS:
        await this.luigiClient
          .linkManager()
          .fromVirtualTreeRoot()
          .openAsModal('setup-osc', { title: 'Add Open Source Checks', width: '600px', height: '780px' })
        break
      case Categories.STATIC_CODE_CHECKS:
        break
    }
  }

  openValidationStage() {
    this.isValidationStageOpen.set(!this.isValidationStageOpen())
  }

  onDetailsOpened(event: Categories) {
    this.detailsOpened.emit(event)
  }

  async isButtonShown(category: Categories) {
    if (!(await this.policyService.isUserStaffed())) {
      return false
    }
    const stepsOfCategory = this.pipelineStepsByCategory.get(category)
    switch (category) {
      case Categories.STATIC_SECURITY_CHECKS:
        // show the button if there are no steps or only fortify step
        return (
          stepsOfCategory.length === 0 || (stepsOfCategory.length === 1 && stepsOfCategory[0].kind === StepKey.FORTIFY)
        )

      case Categories.STATIC_CODE_CHECKS:
        // Always false since sonar cant be added yet
        return false
      case Categories.OPEN_SOURCE_CHECKS:
        // show the button if there is no OSC step (also the case when no steps are set up)
        return !stepsOfCategory.some((ref) => ref.kind === Kinds.OPEN_SOURCE_COMPLIANCE)
    }
    return false
  }

  async generateStatusTag(category: Categories) {
    const stepsOfCategory = this.pipelineStepsByCategory.get(category)

    switch (category) {
      case Categories.STATIC_SECURITY_CHECKS: {
        if (
          stepsOfCategory.some((ref) => ref.status === ServiceStatus.NOT_MANAGED) &&
          this.showWhenNoManagedServices(Categories.STATIC_SECURITY_CHECKS)
        ) {
          const tooltipText = CategorySlotConfigService.generateNotManagedTooltip(
            stepsOfCategory.filter((ref) => ref.status === ServiceStatus.NOT_MANAGED),
          )
          return {
            isStatusTagShown: true,
            statusTagText: 'Not Managed',
            statusTagBackgroundColor: 10 as ColorAccent,
            statusTagInlineHelpText: tooltipText,
          }
        }
        break
      }
      case Categories.STATIC_CODE_CHECKS:
        return { isStatusTagShown: false, statusTagText: null }
      case Categories.OPEN_SOURCE_CHECKS:
        if (
          stepsOfCategory.some((ref) => ref.status === ServiceStatus.NOT_MANAGED) &&
          this.showWhenNoManagedServices(Categories.OPEN_SOURCE_CHECKS)
        ) {
          const tooltipText = CategorySlotConfigService.generateNotManagedTooltip(
            stepsOfCategory.filter((ref) => ref.status === ServiceStatus.NOT_MANAGED),
          )
          return {
            isStatusTagShown: true,
            statusTagText: 'Not Managed',
            statusTagBackgroundColor: 10 as ColorAccent,
            statusTagInlineHelpText: tooltipText,
          }
        } else if (stepsOfCategory.some((ref) => ref.kind === Kinds.OPEN_SOURCE_COMPLIANCE)) {
          if (!(await this.isPPMSScvProvided())) {
            return {
              isStatusTagShown: true,
              statusTagText: 'Not Compliant',
              statusTagBackgroundColor: 1 as ColorAccent,
              statusTagInlineHelpText: "Missing PPMS info. You shouldn't release this component to customers.",
            }
          } else {
            return {
              isStatusTagShown: false,
              statusTagText: null,
            }
          }
        }
    }

    return { isStatusTagShown: false, statusTagText: null }
  }

  managedNotManagedCount(category: Categories) {
    const stepsOfCategory = this.pipelineStepsByCategory.get(category)
    const notManagedServicesCount = stepsOfCategory.filter((ref) => ref.status === ServiceStatus.NOT_MANAGED).length
    const managedServicesCount = stepsOfCategory.length - notManagedServicesCount
    return {
      managedCount: managedServicesCount,
      notManagedCount: notManagedServicesCount,
    }
  }

  showWhenNoManagedServices(category: Categories) {
    const managedNotManagedCount = this.managedNotManagedCount(category)
    const managedServicesCount = managedNotManagedCount.managedCount
    const notManagedServicesCount = managedNotManagedCount.notManagedCount
    return managedServicesCount === 0 && notManagedServicesCount > 0
  }

  getStatusIconConfig(category: Categories) {
    const relevantPipelineSteps = this.pipelineStepsByCategory.get(category)

    if (relevantPipelineSteps.length === 0) {
      return
    } else if (relevantPipelineSteps.every((ref) => ref.kind === StepKey.CHECKMARX || ref.kind === StepKey.FORTIFY)) {
      return { statusIconType: 'ALERT', statusIconInlineHelpText: 'Action Required' }
    } else if (relevantPipelineSteps.every((ref) => ref.status === ServiceStatus.NOT_MANAGED)) {
      return { statusIconType: ServiceStatus.NOT_MANAGED, statusIconInlineHelpText: 'Status Unclear' }
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.FAILING_CREATION)) {
      return { statusIconType: ServiceStatus.FAILING_CREATION }
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.UN_KNOWN)) {
      return { statusIconType: ServiceStatus.UN_KNOWN }
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.NOT_FOUND)) {
      return { statusIconType: ServiceStatus.NOT_FOUND }
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.PENDING_CREATION)) {
      return { statusIconType: ServiceStatus.PENDING_CREATION }
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.CREATED)) {
      return { statusIconType: ServiceStatus.CREATED, statusIconInlineHelpText: 'Setup Completed' }
    }
  }

  isCategoryConfigured(category: Categories) {
    return this.pipelineStepsByCategory.get(category).length !== 0
  }

  generateConfiguredServicesText(category: Categories) {
    const servicesInPipeline = this.pipelineStepsByCategory.get(category)
    servicesInPipeline.sort((a, b) => OrderedStepsByCategory[a.kind] - OrderedStepsByCategory[b.kind])
    return servicesInPipeline.map((ref: ResourceRef) => KindName[ref.kind as keyof typeof KindName]).join(', ')
  }

  async isPPMSScvProvided() {
    const oscDetails = await firstValueFrom(this.openSourceComplianceService.getOpenSourceComplianceRegistration())
    return !!oscDetails.ppmsScv
  }

  /**
   * Generates right side text based on the following rules:
   *
   * For Static Security Checks: if there is only Fortify or only Checkmarx, the text is "Add a compliant service"
   * If there is a combination of managed and not managed services, the text is the number of not managed services
   * IF there are only managed services the text is null.
   * @param category
   * @param refs
   */
  generateRightSideConfig(category: Categories, refs: ResourceRef[]) {
    const managedNotManagedCount = this.managedNotManagedCount(category)
    if (managedNotManagedCount.managedCount === 0 && managedNotManagedCount.notManagedCount > 0) {
      if (refs.every((ref) => ref.kind === StepKey.CHECKMARX || ref.kind === StepKey.FORTIFY)) {
        return { rightSideText: 'Add a compliant service', rightSideTextInlineHelpText: null }
      }
      return null
    } else if (managedNotManagedCount.managedCount > 0 && managedNotManagedCount.notManagedCount > 0) {
      return {
        rightSideText: `${managedNotManagedCount.notManagedCount} Not Managed.`,
        rightSideTextInlineHelpText: CategorySlotConfigService.generateNotManagedTooltip(refs),
      }
    }
    return null
  }
}
