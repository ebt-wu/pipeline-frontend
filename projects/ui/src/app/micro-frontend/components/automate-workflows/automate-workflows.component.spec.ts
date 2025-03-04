import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Categories, Kinds, ServiceStatus } from '@enums'
import { ResourceRef } from '@generated/graphql'
import { ExtensionService } from '../../services/extension.service'
import { AutomateWorkflowsComponent } from './automate-workflows.component'

describe('AutomateWorkflowsComponent', () => {
  let component: AutomateWorkflowsComponent
  let fixture: ComponentFixture<AutomateWorkflowsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomateWorkflowsComponent],
      providers: [
        {
          provide: ExtensionService,
          useValue: {
            getIcon: jest.fn(),
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(AutomateWorkflowsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  describe('isOpenArrowShown', () => {
    it('should be true when github actions details are present with no error', () => {
      component.githubActionsDetails = {
        githubInstance: 'github.tools.sap',
        githubOrgID: 192,
        githubOrgName: 'some-org',
        enablementRef: {
          kind: Kinds.GITHUB_ACTIONS_ENABLEMENT,
          name: 'github-actions-enablement',
          status: ServiceStatus.CREATED,
          error: '',
        } as ResourceRef,
      }
      fixture.detectChanges()

      expect(component.isOpenArrowShown).toBeTruthy()
    })

    it('should be false github actions details are present with an error', () => {
      component.githubActionsDetails = {
        githubInstance: 'github.tools.sap',
        githubOrgID: 192,
        githubOrgName: 'some-org',
        enablementRef: {
          kind: Kinds.GITHUB_ACTIONS_ENABLEMENT,
          name: 'github-actions-enablement',
          status: ServiceStatus.FAILING_CREATION,
          error: 'something',
        } as ResourceRef,
      }
      fixture.detectChanges()

      expect(component.isOpenArrowShown).toBeFalsy()
    })

    it('should be false when github actions details are not present', () => {
      component.githubActionsDetails = undefined
      fixture.detectChanges()

      expect(component.isOpenArrowShown).toBeFalsy()
    })
  })

  describe('statusIconConfig', () => {
    it.each([
      ServiceStatus.CREATED,
      ServiceStatus.PENDING_CREATION,
      ServiceStatus.FAILING_CREATION,
      ServiceStatus.NOT_FOUND,
      ServiceStatus.UN_KNOWN,
    ])('should use enablementRef status %s when githubActionsDetails is present', (providedStatus) => {
      component.githubActionsDetails = {
        githubInstance: 'github.tools.sap',
        githubOrgID: 192,
        githubOrgName: 'some-org',
        enablementRef: {
          kind: Kinds.GITHUB_ACTIONS_ENABLEMENT,
          name: 'github-actions-enablement',
          status: providedStatus,
          error: '',
        } as ResourceRef,
      }
      fixture.detectChanges()
      expect(component.statusIconConfig).toEqual({
        statusIconType: providedStatus,
      })
    })

    it('should not have statusIconConfig when no githubActionsDetails is present', () => {
      component.githubActionsDetails = undefined
      fixture.detectChanges()
      expect(component.statusIconConfig).toBeNull()
    })
  })

  describe('buttonConfig', () => {
    it('isButtonShown should be true for user that is staffed when no gha is setup', () => {
      component.githubActionsDetails = undefined
      component.isUserStaffed.set(true)
      fixture.detectChanges()
      expect(component.buttonConfig.isButtonShown).toBeTruthy()
    })
    it('isButtonShown should be false if user is not staffed', () => {
      component.githubActionsDetails = undefined
      component.isUserStaffed.set(false)
      fixture.detectChanges()
      expect(component.buttonConfig.isButtonShown).toBeFalsy()
    })
    it('isButtonShown should be false if gha is setup', () => {
      component.githubActionsDetails = {
        githubInstance: 'github.tools.sap',
        githubOrgID: 192,
        githubOrgName: 'some-org',
        enablementRef: {
          kind: Kinds.GITHUB_ACTIONS_ENABLEMENT,
          name: 'github-actions-enablement',
          status: ServiceStatus.CREATED,
          error: '',
        } as ResourceRef,
      }
      component.isUserStaffed.set(true)
      fixture.detectChanges()
      expect(component.buttonConfig.isButtonShown).toBeFalsy()
    })
  })

  describe('isGetMoreOutOfActionsBannerShown', () => {
    it.each`
      isBuildPipelineSetup | ghaDetailsPresent | expectedResult
      ${true}              | ${true}           | ${false}
      ${true}              | ${false}          | ${false}
      ${false}             | ${true}           | ${true}
      ${false}             | ${false}          | ${false}
    `(
      'should return $expectedResult when ghaDetailsPresent is $ghaDetailsPresent and buildSetup is $isBuildPipelineSetup',
      ({ ghaDetailsPresent, isBuildPipelineSetup, expectedResult }) => {
        component.githubActionsDetails = ghaDetailsPresent
          ? {
              githubInstance: 'github.tools.sap',
              githubOrgID: 192,
              githubOrgName: 'some-org',
              enablementRef: {
                kind: Kinds.GITHUB_ACTIONS_ENABLEMENT,
                name: 'github-actions-enablement',
                status: ServiceStatus.CREATED,
                error: '',
              } as ResourceRef,
            }
          : undefined

        component.isBuildPipelinePresent = isBuildPipelineSetup
        fixture.detectChanges()
        expect(component.isGetMoreOutOfActionsBannerShown).toEqual(expectedResult)
      },
    )
  })

  describe('openDetails', () => {
    it('detailsOpened event should be emitted be called when isOpenArrowShown is true and openDetails is called', () => {
      jest.spyOn(component, 'isOpenArrowShown', 'get').mockReturnValue(true)
      const emitSpy = jest.spyOn(component.detailsOpened, 'emit')

      fixture.detectChanges()
      component.openDetails(Categories.AUTOMATE_WORKFLOWS)
      expect(emitSpy).toHaveBeenCalledWith(Categories.AUTOMATE_WORKFLOWS)
    })
    it('openDetails should not be called when isOpenArrowShown is false', () => {
      jest.spyOn(component, 'isOpenArrowShown', 'get').mockReturnValue(false)
      const emitSpy = jest.spyOn(component.detailsOpened, 'emit')

      fixture.detectChanges()
      component.openDetails(Categories.AUTOMATE_WORKFLOWS)
      expect(emitSpy).not.toHaveBeenCalled()
    })
  })
})
