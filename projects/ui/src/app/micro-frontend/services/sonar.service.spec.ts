import { fakeAsync, tick } from '@angular/core/testing'
import { ApolloQueryResult } from '@apollo/client/core'
import { DxpIContextMessage, DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { GetSonarQubeProjectQuery } from '@generated/graphql'
import { ApolloBase } from 'apollo-angular'
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks'
import { of } from 'rxjs'
import { BaseAPIService } from './base.service'
import { DELETE_SONARQUBE_PROJECT } from './queries'
import { SonarService } from './sonar.service'

describe('SonarService', () => {
  beforeEach(() => {
    ngMocks.reset()
    jest.resetAllMocks()
    return MockBuilder(SonarService).mock(BaseAPIService).mock(DxpLuigiContextService)
  })

  it('should get SonarQube project successfully', fakeAsync(() => {
    const fixture = MockRender(SonarService)
    const service = fixture.point.componentInstance
    const apiService = ngMocks.findInstance(BaseAPIService)
    const luigiService = ngMocks.findInstance(DxpLuigiContextService)

    const mockContext = { context: { projectId: 'test-project-id' } }
    const mockResponse: ApolloQueryResult<GetSonarQubeProjectQuery> = {
      data: {
        getSonarQubeProject: {
          host: 'http://sonarqube.example.com',
          name: 'Test Project',
          repositoryRef: 'test-repo',
          secretPath: 'secret/path',
          configString: 'config',
        },
      },
      loading: false,
      networkStatus: 7,
    }

    jest
      .spyOn(apiService, 'apollo')
      .mockReturnValue(
        of({ query: jest.fn().mockResolvedValue(mockResponse) } as unknown as ApolloBase<GetSonarQubeProjectQuery>),
      )
    jest.spyOn(luigiService, 'contextObservable').mockReturnValue(of(mockContext as DxpIContextMessage))

    let result
    service.getSonarqubeProject('test-resource').subscribe((res) => {
      result = res
    })
    tick()

    expect(result).toEqual({
      host: 'http://sonarqube.example.com',
      name: 'Test Project',
      repositoryRef: 'test-repo',
      secretPath: 'secret/path',
      configString: 'config',
    })
  }))

  it('should return null if no project found', fakeAsync(() => {
    const fixture = MockRender(SonarService)
    const service = fixture.point.componentInstance
    const apiService = ngMocks.findInstance(BaseAPIService)
    const luigiService = ngMocks.findInstance(DxpLuigiContextService)

    const mockContext = { context: { projectId: 'test-project-id' } }
    const mockResponse: ApolloQueryResult<GetSonarQubeProjectQuery> = {
      data: { getSonarQubeProject: null },
      loading: false,
      networkStatus: 7,
    }
    jest
      .spyOn(apiService, 'apollo')
      .mockReturnValue(of({ query: jest.fn().mockResolvedValue(mockResponse) } as unknown as ApolloBase))
    jest.spyOn(luigiService, 'contextObservable').mockReturnValue(of(mockContext as DxpIContextMessage))

    let result
    service.getSonarqubeProject('test-resource').subscribe((res) => {
      result = res
    })
    tick()

    expect(result).toBeNull()
  }))

  it('should create SonarQube project successfully', fakeAsync(() => {
    const fixture = MockRender(SonarService)
    const service = fixture.point.componentInstance
    const apiService = ngMocks.findInstance(BaseAPIService)
    const luigiService = ngMocks.findInstance(DxpLuigiContextService)

    const mockContext = { context: { projectId: 'test-project-id', componentId: 'test-component-id' } }
    const mockResponse = {
      data: {
        createSonarQubeProject: {
          projectId: 'test-project-id',
          projectName: 'Test Project',
        },
      },
    }

    jest
      .spyOn(apiService, 'apollo')
      .mockReturnValue(of({ mutate: jest.fn().mockResolvedValue(mockResponse) } as unknown as ApolloBase))
    jest.spyOn(luigiService, 'contextObservable').mockReturnValue(of(mockContext as DxpIContextMessage))

    let result
    service.createSonarqubeProject('Test Project').subscribe((res) => {
      result = res
    })
    tick()

    expect(result).toEqual({
      projectId: 'test-project-id',
      projectName: 'Test Project',
    })
  }))

  it('should return null if project creation fails', fakeAsync(() => {
    const fixture = MockRender(SonarService)
    const service = fixture.point.componentInstance
    const apiService = ngMocks.findInstance(BaseAPIService)
    const luigiService = ngMocks.findInstance(DxpLuigiContextService)

    const mockContext = { context: { projectId: 'test-project-id', componentId: 'test-component-id' } }
    const mockResponse = {
      data: null,
      errors: [new Error('something bad happened')],
    }

    jest
      .spyOn(apiService, 'apollo')
      .mockReturnValue(of({ mutate: jest.fn().mockResolvedValue(mockResponse) } as unknown as ApolloBase))
    jest.spyOn(luigiService, 'contextObservable').mockReturnValue(of(mockContext as DxpIContextMessage))

    let result
    service.createSonarqubeProject('Test Project').subscribe((res) => {
      result = res
    })
    tick()

    expect(result).toBeNull()
  }))

  it('should delete a SonarQube project successfully', fakeAsync(() => {
    const fixture = MockRender(SonarService)
    const service = fixture.point.componentInstance
    const apiService = ngMocks.findInstance(BaseAPIService)
    const luigiService = ngMocks.findInstance(DxpLuigiContextService)

    const mockContext = { context: { projectId: 'test-project-id', componentId: 'test-component-id' } }
    const mockResponse = {
      data: {
        deleteSonarQubeProject: 'test-resource',
      },
    }

    const mutateSpy = jest.fn().mockResolvedValue(mockResponse)
    jest.spyOn(apiService, 'apollo').mockReturnValue(of({ mutate: mutateSpy } as unknown as ApolloBase))
    jest.spyOn(luigiService, 'contextObservable').mockReturnValue(of(mockContext as DxpIContextMessage))

    let result
    service.deleteSonarqubeProject('test-resource').subscribe((res) => {
      result = res
    })
    tick()

    expect(result).toEqual('test-resource')
    expect(mutateSpy).toHaveBeenCalledWith({
      mutation: DELETE_SONARQUBE_PROJECT,
      variables: {
        projectId: 'test-project-id',
        deletionPolicy: 'ORPHAN',
        componentId: 'test-component-id',
        resourceName: 'test-resource',
      },
    })
  }))
})
