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
import { FlexibleColumnLayout, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { CategoryConfig, Pipeline, ResourceRef } from '@types'
import { Categories, Kinds, ServiceStatus, Stages, StepKey } from '@enums'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { KindCategory, KindName, OrderedStepsByCategory } from '@constants'
import { CategorySlotComponent } from '../category-slot/category-slot.component'
import { PolicyService } from '../../services/policy.service'

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

    this.categoryMap = {
      [Categories.STATIC_SECURITY_CHECKS]: {
        configuredServicesText: this.generateConfiguredServicesText(Categories.STATIC_SECURITY_CHECKS),
        buttonConfig: {
          isButtonShown: await this.isButtonShown(Categories.STATIC_SECURITY_CHECKS),
          buttonText: 'Add',
          buttonAction: async () => this.openSetupDialog(Categories.STATIC_SECURITY_CHECKS),
        },
        statusTagConfig: {
          isStatusTagShown: (await this.isButtonShown(Categories.STATIC_SECURITY_CHECKS))
            ? this.isStatusTagShown(Categories.STATIC_SECURITY_CHECKS)
            : this.showWhenNoManagedServices(Categories.STATIC_SECURITY_CHECKS),
          statusTagText: 'Not Managed',
        },
        statusIconConfig: {
          statusIconType: this.getStatusIconType(Categories.STATIC_SECURITY_CHECKS),
          statusIconInlineHelpText: null,
        },
        isOpenArrowShown: this.isCategoryConfigured(Categories.STATIC_SECURITY_CHECKS),
        rightSideText: (await this.isButtonShown(Categories.STATIC_SECURITY_CHECKS))
          ? null
          : this.generateRightSideText(Categories.STATIC_SECURITY_CHECKS),
      },
      [Categories.STATIC_CODE_CHECKS]: {
        configuredServicesText: this.generateConfiguredServicesText(Categories.STATIC_CODE_CHECKS),
        buttonConfig: {
          isButtonShown: await this.isButtonShown(Categories.STATIC_CODE_CHECKS),
          buttonText: 'Add',
          buttonAction: async () => this.openSetupDialog(Categories.STATIC_CODE_CHECKS),
        },
        statusTagConfig: {
          isStatusTagShown: this.isStatusTagShown(Categories.STATIC_CODE_CHECKS),
          statusTagText: null,
        },
        statusIconConfig: {
          statusIconType: this.getStatusIconType(Categories.STATIC_CODE_CHECKS),
          statusIconInlineHelpText: null,
        },
        rightSideText: !this.isCategoryConfigured(Categories.STATIC_CODE_CHECKS) ? 'Coming soon' : null,
        isOpenArrowShown: this.isCategoryConfigured(Categories.STATIC_CODE_CHECKS),
      },
      [Categories.OPEN_SOURCE_CHECKS]: {
        configuredServicesText: this.generateConfiguredServicesText(Categories.OPEN_SOURCE_CHECKS),
        buttonConfig: {
          isButtonShown: await this.isButtonShown(Categories.OPEN_SOURCE_CHECKS),
          buttonText: 'Add',
          buttonAction: async () => this.openSetupDialog(Categories.OPEN_SOURCE_CHECKS),
        },
        statusTagConfig: {
          isStatusTagShown: (await this.isButtonShown(Categories.OPEN_SOURCE_CHECKS))
            ? this.isStatusTagShown(Categories.OPEN_SOURCE_CHECKS)
            : this.showWhenNoManagedServices(Categories.OPEN_SOURCE_CHECKS),
          statusTagText: 'Not Managed',
        },
        rightSideText: (await this.isButtonShown(Categories.OPEN_SOURCE_CHECKS))
          ? 'Add a compliant service'
          : this.generateRightSideText(Categories.OPEN_SOURCE_CHECKS),
        statusIconConfig: {
          statusIconType: this.getStatusIconType(Categories.OPEN_SOURCE_CHECKS),
          statusIconInlineHelpText: null,
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

  async openSetupDialog(category: Categories) {
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
    if (!(await this.policyService.canUserSetUpPipeline())) {
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

  isStatusTagShown(category: Categories) {
    const stepsOfCategory = this.pipelineStepsByCategory.get(category)

    switch (category) {
      case Categories.STATIC_SECURITY_CHECKS: {
        if (stepsOfCategory.some((ref) => ref.status === ServiceStatus.NOT_MANAGED)) {
          // if there are any not managed services, show the status tag
          return true
        }
        break
      }
      case Categories.STATIC_CODE_CHECKS:
        return false
      case Categories.OPEN_SOURCE_CHECKS:
        if (stepsOfCategory.some((ref) => ref.status === ServiceStatus.NOT_MANAGED)) {
          // if there are any not managed services, show the status tag
          return true
        }
        break
    }

    return false
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
    if (managedServicesCount === 0 && notManagedServicesCount > 0) {
      return true
    }
    return false
  }
  generateRightSideText(category: Categories) {
    const managedNotManagedCount = this.managedNotManagedCount(category)
    const managedCount = managedNotManagedCount.managedCount
    const notManagedCount = managedNotManagedCount.notManagedCount
    if (managedCount > 0 && notManagedCount > 0) {
      return `${notManagedCount} Not Managed.`
    }
    return null
  }
  getStatusIconType(category: Categories) {
    const relevantPipelineSteps = this.pipelineStepsByCategory.get(category)
    if (relevantPipelineSteps.length === 0) {
      return
    } else if (relevantPipelineSteps.every((ref) => ref.status === ServiceStatus.NOT_MANAGED)) {
      return ServiceStatus.NOT_MANAGED
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.FAILING_CREATION)) {
      return ServiceStatus.FAILING_CREATION
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.UN_KNOWN)) {
      return ServiceStatus.UN_KNOWN
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.NOT_FOUND)) {
      return ServiceStatus.NOT_FOUND
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.PENDING_CREATION)) {
      return ServiceStatus.PENDING_CREATION
    } else if (relevantPipelineSteps.some((ref) => ref.status === ServiceStatus.CREATED)) {
      return ServiceStatus.CREATED
    }
  }

  isCategoryConfigured(category: Categories) {
    return this.pipelineStepsByCategory.get(category).length !== 0
  }

  generateConfiguredServicesText(category: Categories) {
    const servicesInPipeline = this.pipelineStepsByCategory.get(category)
    const sortedSteps = servicesInPipeline.sort(
      (a, b) => OrderedStepsByCategory[a.kind] - OrderedStepsByCategory[b.kind],
    )
    return sortedSteps.map((ref: ResourceRef) => KindName[ref.kind as keyof typeof KindName]).join(', ')
  }
}
