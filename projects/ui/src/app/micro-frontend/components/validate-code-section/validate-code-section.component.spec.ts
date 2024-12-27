import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ValidateCodeSectionComponent } from './validate-code-section.component'
import { Categories, Kinds, ServiceStatus, StepKey } from '@enums'
import { KindName } from '@constants'
import { createPipelineForTests } from '../../../../../test-utils'
import { PolicyService } from '../../services/policy.service'

describe('ValidateCodeSectionComponent', () => {
  let component: ValidateCodeSectionComponent
  let fixture: ComponentFixture<ValidateCodeSectionComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateCodeSectionComponent],
      providers: [
        {
          provide: PolicyService,
          useValue: {
            canUserSetUpPipeline: () => Promise.resolve(true),
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ValidateCodeSectionComponent)
  })

  it('should create', () => {
    component = fixture.componentInstance
    component.pipeline = createPipelineForTests()
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  describe('infoIcon inline help', () => {
    it('should set infoIcon inline help text if there is no service configured for the category', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests()
      await component.ngOnChanges()
      expect(component.categoryMap[Categories.OPEN_SOURCE_CHECKS].infoIconConfig.iconInlineHelpText).toBeTruthy()
      expect(component.categoryMap[Categories.STATIC_CODE_CHECKS].infoIconConfig.iconInlineHelpText).toBeTruthy()
      expect(component.categoryMap[Categories.STATIC_SECURITY_CHECKS].infoIconConfig.iconInlineHelpText).toBeTruthy()
    })
  })

  describe('isButtonShown', () => {
    it('isButtonShown should return true when no resourceRefs are present', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests()
      fixture.detectChanges()
      expect(await component.isButtonShown(Categories.STATIC_SECURITY_CHECKS)).toBeTruthy()
    })

    it('isButtonShown should return true when only CumulusPipeline and StagingService refs are present', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
      ])
      fixture.detectChanges()
      expect(await component.isButtonShown(Categories.STATIC_SECURITY_CHECKS)).toBeTruthy()
    })

    it('isButtonShown should return true when only Fortify and no other validation tools are present', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: StepKey.FORTIFY }])
      fixture.detectChanges()
      expect(await component.isButtonShown(Categories.STATIC_SECURITY_CHECKS)).toBeTruthy()
    })

    it('isButtonShown should return false when Fortify and Checkmarx are present', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: StepKey.FORTIFY }, { kind: StepKey.CHECKMARX }])
      fixture.detectChanges()
      expect(await component.isButtonShown(Categories.STATIC_SECURITY_CHECKS)).toBeFalsy()
    })

    it('isButtonShown should return false when GHAS is present', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: Kinds.GITHUB_ADVANCED_SECURITY }])
      fixture.detectChanges()
      expect(await component.isButtonShown(Categories.STATIC_SECURITY_CHECKS)).toBeFalsy()
    })

    it('isButtonShown should return true when no open source check services exist', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
      ])
      fixture.detectChanges()
      expect(await component.isButtonShown(Categories.OPEN_SOURCE_CHECKS)).toBeTruthy()
    })
  })

  describe('isStatusTagShown', () => {
    it('should show statusTag for Static Security Checks when only Fortify is present', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
        {
          kind: StepKey.FORTIFY,
          status: ServiceStatus.NOT_MANAGED,
        },
      ])
      fixture.detectChanges()
      expect(component.isStatusTagShown(Categories.STATIC_SECURITY_CHECKS)).toBeTruthy()
    })
    it('should show statusTag for Static Security Checks if GHAS is present', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        { kind: Kinds.GITHUB_ADVANCED_SECURITY },
        {
          kind: StepKey.FORTIFY,
          status: ServiceStatus.NOT_MANAGED,
        },
        { kind: Kinds.CUMULUS_PIPELINE },
        { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
      ])
      fixture.detectChanges()
      expect(component.isStatusTagShown(Categories.STATIC_SECURITY_CHECKS)).toBeTruthy()
    })

    it('should not show statusTag for Static Security Checks if no static security checks are present', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests()
      fixture.detectChanges()
      expect(component.isStatusTagShown(Categories.STATIC_SECURITY_CHECKS)).toBeFalsy()
    })

    it('should not show statusTag for Static Code Checks case when SonarQube is not there', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests()
      fixture.detectChanges()
      expect(component.isStatusTagShown(Categories.STATIC_CODE_CHECKS)).toBeFalsy()
    })
    it('should not show statusTag not managed for Static Code Checks case when SonarQube is there, since SonarQube is managed', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: Kinds.SONAR_QUBE_PROJECT }])
      fixture.detectChanges()
      expect(component.isStatusTagShown(Categories.STATIC_CODE_CHECKS)).toBeFalsy()
    })
    it('should show statusTag for Open Source Checks when Mend is present and no OSC', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: StepKey.WHITE_SOURCE, status: ServiceStatus.NOT_MANAGED }])
      fixture.detectChanges()
      expect(component.isStatusTagShown(Categories.OPEN_SOURCE_CHECKS)).toBeTruthy()
    })
    it('should show statusTag for Open Source Checks when Mend and OSC are both present', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: StepKey.WHITE_SOURCE,
          status: ServiceStatus.NOT_MANAGED,
        },
        { kind: Kinds.OPEN_SOURCE_COMPLIANCE },
      ])
      fixture.detectChanges()
      expect(component.isStatusTagShown(Categories.OPEN_SOURCE_CHECKS)).toBeTruthy()
    })
    it('should not show statusTag for Open Source Checks when no resources present', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([])
      fixture.detectChanges()
      expect(component.isStatusTagShown(Categories.OPEN_SOURCE_CHECKS)).toBeFalsy()
    })
  })
  describe('generateConfiguredServicesText', () => {
    it("should return the service's name if there is only one service in the category", () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: Kinds.GITHUB_ADVANCED_SECURITY }])
      fixture.detectChanges()
      expect(component.generateConfiguredServicesText(Categories.STATIC_SECURITY_CHECKS)).toEqual(
        KindName[Kinds.GITHUB_ADVANCED_SECURITY],
      )
    })

    it('should separate the services with a comma if there are multiple services in the category', () => {
      // generate the test
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: StepKey.FORTIFY }, { kind: Kinds.GITHUB_ADVANCED_SECURITY }])

      fixture.detectChanges()
      expect(component.generateConfiguredServicesText(Categories.STATIC_SECURITY_CHECKS)).toEqual(
        `${KindName[Kinds.GITHUB_ADVANCED_SECURITY]}, ${KindName[StepKey.FORTIFY]}`,
      )
    })
    it('for category static security checks: GHAS should be first, then checkmarxOne, checkmarx and fortify', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        { kind: StepKey.FORTIFY },
        { kind: StepKey.CHECKMARX },
        { kind: StepKey.CX_ONE },
        { kind: Kinds.GITHUB_ADVANCED_SECURITY },
      ])
      fixture.detectChanges()
      expect(component.generateConfiguredServicesText(Categories.STATIC_SECURITY_CHECKS)).toEqual(
        `${KindName[Kinds.GITHUB_ADVANCED_SECURITY]}, ${KindName[StepKey.CX_ONE]}, ${KindName[StepKey.CHECKMARX]}, ${KindName[StepKey.FORTIFY]}`,
      )
    })
  })

  describe('getStatusIconType', () => {
    it('should return NOT_MANAGED if all services in the category are in NOT_MANAGED status', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: StepKey.FORTIFY,
          status: ServiceStatus.NOT_MANAGED,
        },
        { kind: StepKey.CHECKMARX, status: ServiceStatus.NOT_MANAGED },
      ])
      fixture.detectChanges()
      expect(component.getStatusIconType(Categories.STATIC_SECURITY_CHECKS)).toEqual(ServiceStatus.NOT_MANAGED)
    })

    it('should return CREATED if at least one service in the category is in CREATED status and none in FAILING_CREATION', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: Kinds.GITHUB_ADVANCED_SECURITY,
          status: ServiceStatus.CREATED,
        },
        { kind: StepKey.CHECKMARX, status: ServiceStatus.NOT_MANAGED },
      ])
      fixture.detectChanges()
      expect(component.getStatusIconType(Categories.STATIC_SECURITY_CHECKS)).toEqual(ServiceStatus.CREATED)
    })
    it('should return FAILING_CREATION if at least one service in the category is in FAILING_CREATION status', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: StepKey.FORTIFY,
          status: ServiceStatus.NOT_MANAGED,
        },
        { kind: Kinds.GITHUB_ADVANCED_SECURITY, status: ServiceStatus.FAILING_CREATION },
      ])
      fixture.detectChanges()
      expect(component.getStatusIconType(Categories.STATIC_SECURITY_CHECKS)).toEqual(ServiceStatus.FAILING_CREATION)
    })
    it('should return undefined if no resourceRefs are in the category', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests()
      fixture.detectChanges()
      expect(component.getStatusIconType(Categories.STATIC_SECURITY_CHECKS)).toBeUndefined()
    })
    it('should return status UNKNOWN if there is at least one resource with unknown status', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: Kinds.OPEN_SOURCE_COMPLIANCE,
          status: ServiceStatus.UN_KNOWN,
        },
      ])
      fixture.detectChanges()
      expect(component.getStatusIconType(Categories.OPEN_SOURCE_CHECKS)).toEqual(ServiceStatus.UN_KNOWN)
    })
    it('should return status NOT_FOUND if there is at least one resource with not found status in the category', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: Kinds.OPEN_SOURCE_COMPLIANCE,
          status: ServiceStatus.NOT_FOUND,
        },
      ])
      fixture.detectChanges()
      expect(component.getStatusIconType(Categories.OPEN_SOURCE_CHECKS)).toEqual(ServiceStatus.NOT_FOUND)
    })

    it('should return status PENDING_CREATION if there is at least one resource in the category with PENDING_CREATION status', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: Kinds.OPEN_SOURCE_COMPLIANCE,
          status: ServiceStatus.PENDING_CREATION,
        },
        { kind: Kinds.PIPER_CONFIG, status: ServiceStatus.CREATED },
      ])
      fixture.detectChanges()
      expect(component.getStatusIconType(Categories.OPEN_SOURCE_CHECKS)).toEqual(ServiceStatus.PENDING_CREATION)
    })
  })
})
