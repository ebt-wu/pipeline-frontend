import { ServiceDetailsSkeletonComponent } from './service-details-skeleton.component'
import { MockBuilder, MockedDebugElement, MockRender, ngMocks } from 'ng-mocks'
import { DebugModeService } from '../../services/debug-mode.service'
import { Categories, Kinds, ServiceStatus, StepKey } from '@enums'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { of } from 'rxjs'
import { APIService } from '../../services/api.service'
import { GithubService } from '../../services/github.service'
import { createPipelineForTests } from '../../../../../test-utils'

const context = {
  frameContext: undefined,
  frameBaseUrl: 'test-url',
  tenantid: '1',
  projectId: 'project',
  token: '2',
  userid: '3',
  entityContext: undefined,
}

const pipelineData = createPipelineForTests(
  [
    { kind: Kinds.GITHUB_ADVANCED_SECURITY },
    { kind: Kinds.CUMULUS_PIPELINE },
    { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
    {
      kind: StepKey.CX_ONE,
      status: ServiceStatus.NOT_MANAGED,
    },
  ],
  {
    pipelineCreationTimestamp: '',
    azureDevOps: null,
    cnb: null,
    xmake: null,
    commonRepository: null,
    blackDuckHub: null,
    checkmarx: null,
    checkmarxOne: {
      applicationName: 'JULIA APPLICATION',
      applicationUrl: 'https://google.com',
      projectName: 'julia Project',
      secretPath: 'secret/data/julia',
    },
    fortify: {
      projectName: 'FORTIFY PROJECT',
      secretPath: 'secret/data/fortify',
    },
    whiteSource: null,
    ppmsFoss: null,
    kubernetes: null,
    cloudFoundry: null,
  },
)

const mockAPIService: Partial<APIService> = {
  // @ts-expect-error only mocking the getGithubMetadata function, as the rest of the service is not needed
  githubService: {
    getGithubMetadata: jest.fn().mockResolvedValue({
      githubRepoUrl: 'test-github-url',
      githubRepoName: 'test-name',
      githubInstance: 'test-instance',
      githubOrgName: 'some-org',
    }),
  } as Partial<GithubService>,
}

describe('ServiceDetailsSkeletonComponent', () => {
  beforeEach(async () => {
    return MockBuilder(ServiceDetailsSkeletonComponent)
      .keep(DebugModeService)
      .mock(DxpLuigiContextService, {
        contextObservable: jest.fn().mockReturnValue(of({ context })),
        getContextAsync: jest.fn().mockResolvedValue(context),
      })
      .mock(APIService, mockAPIService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create with pipeline data', () => {
    const fixture = MockRender(ServiceDetailsSkeletonComponent, {
      context,
      activeCategory: Categories.COMPLIANCE,
      leanIxData: [],
      pipeline: pipelineData,
    })
    const component = fixture.point.componentInstance
    expect(component).toBeDefined()
  })
  it('should create with an activeCategory with multiple services and only one header', () => {
    const fixture = MockRender(ServiceDetailsSkeletonComponent, {
      context,
      activeCategory: Categories.STATIC_SECURITY_CHECKS,
      leanIxData: [],
      pipeline: pipelineData,
    })

    const headerElements: MockedDebugElement<HTMLElement>[] = ngMocks.findAll(fixture, '.header-text')
    expect(headerElements.length).toEqual(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    expect(headerElements[0].nativeElement.textContent.trim()).toEqual('Static Security Checks')
  })
  it('should create with one activeCategory and one header', () => {
    const fixture = MockRender(ServiceDetailsSkeletonComponent, {
      context,
      activeCategory: Categories.ORCHESTRATION,
      leanIxData: [],
      pipeline: pipelineData,
    })

    const headerElements = ngMocks.findAll(fixture, '.header-text')
    expect(headerElements.length).toEqual(1)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    expect(headerElements[0].nativeElement.textContent.trim()).toEqual('Orchestration')
  })

  it('should render GHAS, CxOne and Fortify', () => {
    const fixture = MockRender(ServiceDetailsSkeletonComponent, {
      context,
      activeCategory: Categories.STATIC_SECURITY_CHECKS,
      leanIxData: [],
      pipeline: pipelineData,
    })
    fixture.detectChanges()

    const headerElements = ngMocks.findAll(fixture, '.headline')
    expect(headerElements.length).toEqual(3)

    headerElements.forEach((element: MockedDebugElement<HTMLElement>, index: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      expect(element.nativeElement.textContent.trim()).toEqual(
        ['GitHub Advanced Security', 'Checkmarx ONE', 'Fortify'][index],
      )
    })
  })

  describe('findAndSortServicesFromCategory', () => {
    it(
      'should return the correct resources for the category when ' +
        'resources are some resourceRefs and some NotManagedServices',
      () => {
        const fixture = MockRender(ServiceDetailsSkeletonComponent, {
          context,
          activeCategory: Categories.STATIC_SECURITY_CHECKS,
          leanIxData: [],
          pipeline: createPipelineForTests(
            [
              { kind: Kinds.CUMULUS_PIPELINE },
              { kind: Kinds.STAGING_SERVICE_CREDENTIAL },
              { kind: Kinds.GITHUB_ADVANCED_SECURITY },
              { kind: Kinds.GITHUB_REPOSITORY },
            ],
            {
              pipelineCreationTimestamp: '',

              checkmarxOne: {
                applicationName: 'JULIA APPLICATION',
                applicationUrl: 'https://google.com',
                projectName: 'julia Project',
                secretPath: 'secret/data/julia',
              },
              fortify: {
                projectName: 'FORTIFY PROJECT',
                secretPath: 'secret/data/fortify',
              },
            },
          ),
        })
        const component = fixture.point.componentInstance
        const resources = component.findAndSortServicesFromCategory(Categories.STATIC_SECURITY_CHECKS)
        expect(resources).toEqual([Kinds.GITHUB_ADVANCED_SECURITY, StepKey.CX_ONE, StepKey.FORTIFY])
      },
    )

    it('should return the correct resources for the category when resources are all provided as resourceRefs', () => {
      const fixture = MockRender(ServiceDetailsSkeletonComponent, {
        context,
        activeCategory: Categories.STATIC_SECURITY_CHECKS,
        leanIxData: [],
        pipeline: createPipelineForTests([
          {
            kind: Kinds.GITHUB_ADVANCED_SECURITY,
            status: ServiceStatus.CREATED,
          },
          { kind: StepKey.CX_ONE, status: ServiceStatus.NOT_MANAGED },
          {
            kind: StepKey.FORTIFY,
            status: ServiceStatus.NOT_MANAGED,
          },
        ]),
      })

      const component = fixture.point.componentInstance
      const services = component.findAndSortServicesFromCategory(Categories.STATIC_SECURITY_CHECKS)
      expect(services).toEqual([Kinds.GITHUB_ADVANCED_SECURITY, StepKey.CX_ONE, StepKey.FORTIFY])
    })
  })

  describe('set installation date', () => {
    it('should set the installation date for not managed services by checking the pipelineCreationTimestamp', () => {
      const fixture = MockRender(ServiceDetailsSkeletonComponent, {
        context,
        activeCategory: Categories.STATIC_SECURITY_CHECKS,
        leanIxData: [],
        pipeline: createPipelineForTests(
          [
            {
              kind: Kinds.GITHUB_REPOSITORY,
              status: ServiceStatus.CREATED,
            },
            { kind: StepKey.CX_ONE, status: ServiceStatus.NOT_MANAGED },
          ],
          {
            pipelineCreationTimestamp: '2024-10-29T12:56:35Z',
          },
        ),
      })
      const component = fixture.point.componentInstance
      expect(component.getInstallationDate(StepKey.CX_ONE)).toEqual(new Date('2024-10-29T12:56:35Z'))
    })
  })
  describe('error states', () => {
    it('should show "Error" next to the service name for every service that is failingCreation', () => {
      const fixture = MockRender(ServiceDetailsSkeletonComponent, {
        context,
        activeCategory: Categories.STATIC_SECURITY_CHECKS,
        leanIxData: [],
        pipeline: createPipelineForTests(
          [
            {
              kind: Kinds.GITHUB_ADVANCED_SECURITY,
              status: ServiceStatus.FAILING_CREATION,
            },
            { kind: StepKey.CX_ONE, status: ServiceStatus.NOT_MANAGED },
          ],
          {
            pipelineCreationTimestamp: '2024-10-29T12:56:35Z',
          },
        ),
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(fixture.nativeElement.textContent).toContain('Error')
    })
  })
})
