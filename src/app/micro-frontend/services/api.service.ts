import { Injectable, Injector } from '@angular/core';
import { BaseApolloClientService } from '@dxp/ngx-core/apollo'
import { Context } from '@luigi-project/client';


@Injectable({ providedIn: 'root' })
export class APIService extends BaseApolloClientService {

    constructor(injector: Injector) {
        super(injector, 'automaticd');
    }

    protected getApiUrl(luigiContext: Context): string {
        return luigiContext.frameContext.automaticDServiceApiUrl
    }
}