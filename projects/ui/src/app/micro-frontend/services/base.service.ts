import { Injectable, Injector } from '@angular/core'
import { BaseApolloClientService } from '@dxp/ngx-core/apollo'
import { Context } from '@luigi-project/client'
import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class BaseAPIService extends BaseApolloClientService {
  constructor(injector: Injector) {
    super(injector, 'automaticd')
  }

  protected getApiUrl(luigiContext: Context): string {
    // local backend:
    if (environment.useLocalPipelineBackend) {
      return 'http://localhost:3000/query'
    }
    // hosted backend:
    return luigiContext.frameContext.pipelineBackendUrl
  }
}
