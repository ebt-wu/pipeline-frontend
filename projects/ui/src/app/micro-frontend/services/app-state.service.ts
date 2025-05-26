import { Injectable } from '@angular/core'
import { DxpIContextMessage } from '@dxp/ngx-core/luigi'
import { ApolloBase } from 'apollo-angular'

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  get context(): DxpIContextMessage {
    return this._context
  }

  set context(value: DxpIContextMessage) {
    this._context = value
  }

  get apolloClient(): ApolloBase {
    return this._apolloClient
  }

  set apolloClient(value: ApolloBase) {
    this._apolloClient = value
  }
  private _context: DxpIContextMessage
  private _apolloClient: ApolloBase
}
