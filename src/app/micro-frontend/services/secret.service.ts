import { Injectable } from '@angular/core'
import { APIService } from './api.service'
import { first, map, mergeMap } from 'rxjs/operators'
import { Observable, combineLatest, lastValueFrom } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { ENSURE_VAULT_ONBOARDING, GET_PIPELINE_SECRETS, WRITE_SECRET } from './queries'

export interface GetPipelineSecretsResponse {
  getPipelineSecrets: string[]
}

export interface WriteSecretResponse {
  writeSecret: string
}

export interface EnsureVaultOnboardingResponse {
  ensureVaultOnboarding: VaultInfo
}

export interface VaultInfo {
  token: string
  vaultUrl: string
}

export interface SecretData {
  key: string
  value: string
}

@Injectable({ providedIn: 'root' })
export class SecretService {
  constructor(private readonly apiService: APIService, private readonly luigiService: DxpLuigiContextService) {}

  writeSecret(vaultPath: string, secretData: SecretData[]): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<WriteSecretResponse>({
            mutation: WRITE_SECRET,
            variables: {
              projectId: ctx.context.projectId,
              vaultPath: vaultPath,
              data: secretData,
            },
          })
          .pipe(map((res) => res.data?.writeSecret ?? ''))
      })
    )
  }

  getPipelineSecrets(): Observable<string[]> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetPipelineSecretsResponse>({
            query: GET_PIPELINE_SECRETS,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(map((res) => res.data?.getPipelineSecrets ?? []))
      })
    )
  }

  ensureVaultOnboarding(): Observable<VaultInfo> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<EnsureVaultOnboardingResponse>({
            mutation: ENSURE_VAULT_ONBOARDING,
            variables: {
              tenantId: ctx.context.tenantid,
              projectId: ctx.context.projectId,
            },
          })
          .pipe(map((res) => res.data.ensureVaultOnboarding ?? null))
      })
    )
  }

  /**
   * Only works for a path to a secret not to another path
   * @param secretPath
   * @returns a vault url with wrapped token directly pointing to a secret
   */
  async getVaultUrlOfSecret(secretPath: string): Promise<string> {
    const { vaultUrl } = await lastValueFrom(this.ensureVaultOnboarding())
    const url = new URL(vaultUrl)
    const redirect = url.searchParams.get('redirect_to')

    let redirectDecoded = decodeURIComponent(redirect)
    redirectDecoded = redirectDecoded.replace('list', 'show')

    let redirectArr = redirectDecoded.split('?')
    redirectArr[0] += `/${secretPath}`

    redirectDecoded = redirectArr.join('?')

    url.searchParams.set('redirect_to', redirectDecoded)

    return url.href
  }
}
