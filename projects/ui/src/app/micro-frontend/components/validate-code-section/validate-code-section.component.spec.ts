import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ValidateCodeSectionComponent } from './validate-code-section.component'
import { Categories, Kinds, ServiceStatus, StepKey } from '@enums'
import { KindName } from '@constants'
import { createPipelineForTests } from '../../../../../test-utils'
import { PolicyService } from '../../services/policy.service'
import { ColorAccent } from '@fundamental-ngx/core'
import { OpenSourceComplianceService } from '../../services/open-source-compliance.service'
import { MockService } from 'ng-mocks'

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
        {
          provide: OpenSourceComplianceService,
          useValue: MockService(OpenSourceComplianceService),
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

  describe('generateStatusTag', () => {
    it('should show statusTag with Not Managed label for Static Security Checks when only Fortify is present HSOBRD-117', async () => {
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
      const result = await component.generateStatusTag(Categories.STATIC_SECURITY_CHECKS)
      expect(result.isStatusTagShown).toBeTruthy()
      expect(result.statusTagText).toEqual('Not Managed')
    })
    it('should not show statusTag for Static Security Checks if no static security checks are present HSOBRD-117', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests()
      fixture.detectChanges()
      const result = await component.generateStatusTag(Categories.STATIC_SECURITY_CHECKS)
      expect(result.isStatusTagShown).toBeFalsy()
      expect(result.statusTagText).toBeFalsy()
    })

    it('should not show statusTag for Static Code Checks case when SonarQube is not there HSOBRD-117', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests()
      fixture.detectChanges()

      const result = await component.generateStatusTag(Categories.STATIC_CODE_CHECKS)
      expect(result.isStatusTagShown).toBeFalsy()
      expect(result.statusTagText).toBeFalsy()
    })
    it('should not show statusTag not managed for Static Code Checks case when SonarQube is there, since SonarQube is managed HSOBRD-117', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: Kinds.SONAR_QUBE_PROJECT }])
      fixture.detectChanges()

      const result = await component.generateStatusTag(Categories.STATIC_CODE_CHECKS)
      expect(result.isStatusTagShown).toBeFalsy()
      expect(result.statusTagText).toBeFalsy()
    })
    it('should show statusTag for Open Source Checks when Mend is present and no OSC HSOBRD-117', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: StepKey.WHITE_SOURCE, status: ServiceStatus.NOT_MANAGED }])
      fixture.detectChanges()

      const result = await component.generateStatusTag(Categories.OPEN_SOURCE_CHECKS)
      expect(result.isStatusTagShown).toBeTruthy()
      expect(result.statusTagText).toEqual('Not Managed')
    })
    it("shouldn't show statusTag for Open Source Checks when Mend and OSC are both present and PPMS SCV is provided", async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: StepKey.WHITE_SOURCE,
          status: ServiceStatus.NOT_MANAGED,
        },
        { kind: Kinds.OPEN_SOURCE_COMPLIANCE },
      ])
      component.isPPMSScvProvided = jest.fn().mockReturnValue(true)
      fixture.detectChanges()
      const result = await component.generateStatusTag(Categories.OPEN_SOURCE_CHECKS)
      expect(result.isStatusTagShown).toBeFalsy()
      expect(result.statusTagText).toBeFalsy()
    })

    it("should show statusTag with Not Compliant label for Open Source Checks when Mend and OSC are both present and PPMS SCV isn't provided HSOBRD-117", async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: StepKey.WHITE_SOURCE,
          status: ServiceStatus.NOT_MANAGED,
        },
        { kind: Kinds.OPEN_SOURCE_COMPLIANCE },
      ])
      component.isPPMSScvProvided = jest.fn().mockReturnValue(false)
      fixture.detectChanges()
      const result = await component.generateStatusTag(Categories.OPEN_SOURCE_CHECKS)
      expect(result.isStatusTagShown).toBeTruthy()
      expect(result.statusTagText).toEqual('Not Compliant')
      expect(result.statusTagBackgroundColor).toEqual(1 as ColorAccent)
    })
    it('should not show statusTag for Open Source Checks when no resources present', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([])
      fixture.detectChanges()
      expect((await component.generateStatusTag(Categories.OPEN_SOURCE_CHECKS)).isStatusTagShown).toBeFalsy()
    })

    it('statusTagConfig for OSC should be have text Not Compliant if OSC is setup without SCV', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: Kinds.OPEN_SOURCE_COMPLIANCE }])
      component.isPPMSScvProvided = jest.fn().mockReturnValue(false)
      await component.ngOnChanges()
      const result = await component.generateStatusTag(Categories.OPEN_SOURCE_CHECKS)
      expect(result.statusTagText).toEqual('Not Compliant')
      expect(result.statusTagBackgroundColor).toEqual(1 as ColorAccent)
      expect(result.statusTagInlineHelpText).toEqual(
        "Missing PPMS info. You shouldn't release this component to customers.",
      )
    })
    it('statusTagConfig for OSC should be empty if only OSC is set up with SCV', async () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: Kinds.OPEN_SOURCE_COMPLIANCE }])
      component.isPPMSScvProvided = jest.fn().mockReturnValue(true)
      await component.ngOnChanges()
      const result = await component.generateStatusTag(Categories.OPEN_SOURCE_CHECKS)
      expect(result.statusTagText).toBeFalsy()
      expect(result.statusTagInlineHelpText).toBeFalsy()
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

  describe('getStatusIconConfig', () => {
    it('should return NOT_MANAGED if all services in the category are in NOT_MANAGED status and they arent fortify or checkmarxHSOBRD-117', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: StepKey.BLACK_DUCK_HUB,
          status: ServiceStatus.NOT_MANAGED,
        },
      ])
      fixture.detectChanges()
      expect(component.getStatusIconConfig(Categories.OPEN_SOURCE_CHECKS).statusIconType).toEqual(
        ServiceStatus.NOT_MANAGED,
      )
    })

    it('should return ALERT if only Fortify is present HSOBRD-117', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        {
          kind: StepKey.FORTIFY,
          status: ServiceStatus.NOT_MANAGED,
        },
      ])
      fixture.detectChanges()
      expect(component.getStatusIconConfig(Categories.STATIC_SECURITY_CHECKS).statusIconType).toEqual('ALERT')
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
      expect(component.getStatusIconConfig(Categories.STATIC_SECURITY_CHECKS).statusIconType).toEqual(
        ServiceStatus.CREATED,
      )
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
      expect(component.getStatusIconConfig(Categories.STATIC_SECURITY_CHECKS).statusIconType).toEqual(
        ServiceStatus.FAILING_CREATION,
      )
    })
    it('should return undefined if no resourceRefs are in the category', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests()
      fixture.detectChanges()
      expect(component.getStatusIconConfig(Categories.STATIC_SECURITY_CHECKS)).toBeUndefined()
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
      expect(component.getStatusIconConfig(Categories.OPEN_SOURCE_CHECKS).statusIconType).toEqual(
        ServiceStatus.UN_KNOWN,
      )
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
      expect(component.getStatusIconConfig(Categories.OPEN_SOURCE_CHECKS).statusIconType).toEqual(
        ServiceStatus.NOT_FOUND,
      )
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
      expect(component.getStatusIconConfig(Categories.OPEN_SOURCE_CHECKS).statusIconType).toEqual(
        ServiceStatus.PENDING_CREATION,
      )
    })
  })
  describe('generateRightSideConfig', () => {
    it('should have "Add a compliant service" if the only service is fortify', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: StepKey.FORTIFY, status: ServiceStatus.NOT_MANAGED }])
      fixture.detectChanges()
      expect(
        component.generateRightSideConfig(Categories.STATIC_SECURITY_CHECKS, component.pipeline.resourceRefs)
          .rightSideText,
      ).toEqual('Add a compliant service')
    })
    it('should have "Add a compliant service" if the only service is checkmarx', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: StepKey.CHECKMARX, status: ServiceStatus.NOT_MANAGED }])
      fixture.detectChanges()
      expect(
        component.generateRightSideConfig(Categories.STATIC_SECURITY_CHECKS, component.pipeline.resourceRefs)
          .rightSideText,
      ).toEqual('Add a compliant service')
    })

    it('should have `1 Not Managed.` and a tooltip text if there is only one not managed service and a managed one', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([
        { kind: StepKey.FORTIFY, status: ServiceStatus.NOT_MANAGED },
        { kind: Kinds.GITHUB_ADVANCED_SECURITY },
      ])
      fixture.detectChanges()
      expect(
        component.generateRightSideConfig(Categories.STATIC_SECURITY_CHECKS, component.pipeline.resourceRefs),
      ).toEqual({
        rightSideText: '1 Not Managed.',
        rightSideTextInlineHelpText:
          "Fortify is not available in the Hyperspace Portal. Your setup can't be managed or edited from here.",
      })
    })
    it('should return null when only managed services present', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: Kinds.GITHUB_ADVANCED_SECURITY }])
      fixture.detectChanges()
      expect(
        component.generateRightSideConfig(Categories.STATIC_SECURITY_CHECKS, component.pipeline.resourceRefs),
      ).toBeNull()
    })
    it('should return null when only not-managed services present', () => {
      component = fixture.componentInstance
      component.pipeline = createPipelineForTests([{ kind: StepKey.BLACK_DUCK_HUB, status: ServiceStatus.NOT_MANAGED }])
      fixture.detectChanges()
      expect(
        component.generateRightSideConfig(Categories.OPEN_SOURCE_CHECKS, component.pipeline.resourceRefs),
      ).toBeNull()
    })
  })
})
