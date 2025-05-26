import { DxpIContextMessage } from '@dxp/ngx-core/luigi'
import { IContextMessage, LuigiContextService } from '@luigi-project/client-support-angular'
import { ApolloBase } from 'apollo-angular'
import { MockService } from 'ng-mocks'
import { firstValueFrom, Observable, of } from 'rxjs'
import { AppStateService } from '../services/app-state.service'
import { BaseAPIService } from '../services/base.service'
import { AppStateInitializer } from './app-state.provider'

describe('AppStateProvider', () => {
  it('should initialize app state', async () => {
    const appStateService = new AppStateService()

    const luigiService = MockService(LuigiContextService, {
      contextObservable(): Observable<IContextMessage> {
        return of({} as DxpIContextMessage)
      },
    })
    const apiService = MockService(BaseAPIService, {
      apollo(): Observable<ApolloBase> {
        return of({} as ApolloBase)
      },
    })
    const observable: Observable<any> = AppStateInitializer.useFactory(luigiService, apiService, appStateService)()
    await firstValueFrom(observable)
    expect(appStateService.apolloClient).not.toBe(null)
    expect(appStateService.context).not.toBe(null)
  })
})
