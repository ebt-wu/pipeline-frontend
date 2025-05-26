import { APP_INITIALIZER, FactoryProvider, InjectionToken, Provider } from '@angular/core'
import { DxpIContextMessage, DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { ApolloBase } from 'apollo-angular'
import { catchError, combineLatest, first, of, tap, timeout } from 'rxjs'
import { AppStateService } from '../services/app-state.service'
import { BaseAPIService } from '../services/base.service'

export const CONTEXT = new InjectionToken<DxpIContextMessage>('LuigiCurrentContext')
export const CLIENT = new InjectionToken<ApolloBase>('ApolloBaseClient')

const appStateFactory = (
  luigiService: DxpLuigiContextService,
  apiService: BaseAPIService,
  stateService: AppStateService,
) => {
  return () => {
    return combineLatest([luigiService.contextObservable(), apiService.apollo()]).pipe(
      first(),
      tap(([context, api]) => {
        stateService.apolloClient = api
        stateService.context = context
      }),
      timeout(10000),
      catchError(() => of({})),
    )
  }
}

export const AppStateInitializer: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: appStateFactory,
  multi: true,
  deps: [DxpLuigiContextService, BaseAPIService, AppStateService],
}

// This provider makes LuigiContext injectable via Angular DI
export const AppStateProvider: Provider = {
  provide: CONTEXT,
  useFactory: (state: AppStateService) => state.context,
  deps: [AppStateService],
}
export const ApolloClientProvider: Provider = {
  provide: CLIENT,
  useFactory: (state: AppStateService) => state.apolloClient,
  deps: [AppStateService],
}
