import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { first, map, mergeMap } from 'rxjs/operators'
import { Observable, combineLatest, lastValueFrom, firstValueFrom } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { ENSURE_VAULT_ONBOARDING, GET_PIPELINE_SECRETS, WRITE_SECRET } from './queries'
import {
  EnsureVaultOnboardingMutation,
  EnsureVaultOnboardingMutationVariables,
  GetPipelineSecretsQuery,
  GetPipelineSecretsQueryVariables,
  WriteSecretMutation,
  WriteSecretMutationVariables,
} from '../../../generated/graphql'

export interface SecretData {
  key: string
  value: string
}

export interface Secret {
  path: string
  metadata?: {
    scopes?: string
  }
}

@Injectable({ providedIn: 'root' })
export class SecretService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  writeSecret(vaultPath: string, secretData: WriteSecretMutationVariables['data']): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<WriteSecretMutation, WriteSecretMutationVariables>({
            mutation: WRITE_SECRET,
            variables: {
              projectId: ctx.context.projectId,
              vaultPath: vaultPath,
              data: secretData,
            },
          })
          .pipe(map((res) => res.data?.writeSecret ?? ''))
      }),
    )
  }

  getPipelineSecrets(): Observable<Secret[]> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetPipelineSecretsQuery, GetPipelineSecretsQueryVariables>({
            query: GET_PIPELINE_SECRETS,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(map((res) => res.data?.getPipelineSecrets ?? []))
      }),
    )
  }

  ensureVaultOnboarding() {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<EnsureVaultOnboardingMutation, EnsureVaultOnboardingMutationVariables>({
            mutation: ENSURE_VAULT_ONBOARDING,
            variables: {
              tenantId: ctx.context.tenantid,
              projectId: ctx.context.projectId,
            },
          })
          .pipe(map((res) => res.data.ensureVaultOnboarding ?? null))
      }),
    )
  }

  public async storeCredential(credentialPrefix: string, secretData: SecretData[], userId: string): Promise<string> {
    const path = `GROUP-SECRETS/${credentialPrefix}-${userId}`
    await firstValueFrom(this.writeSecret(path, secretData))
    return path
  }

  public getCredentialPath(selectCredentialValue: string, componentId: string): string {
    if (selectCredentialValue.includes('GROUP-SECRETS')) {
      return selectCredentialValue
    }
    return `${componentId}/${selectCredentialValue}`
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
    redirectDecoded = redirectDecoded.replace('/list', '')

    const redirectArr = redirectDecoded.split('?')
    redirectArr[0] += `/${secretPath}`

    // path to secret after /kv needs to be encoded
    redirectArr[0] = `/vault/secrets/piper/kv/${encodeURIComponent(
      redirectArr[0].split('/vault/secrets/piper/kv/')[1],
    )}`

    redirectDecoded = redirectArr.join('?')

    url.searchParams.set('redirect_to', redirectDecoded)

    return url.href
  }
}
