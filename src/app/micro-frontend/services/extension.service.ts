import { gql } from 'apollo-angular'
import { Observable, combineLatest, first, map, mergeMap } from 'rxjs'
import { ExtensionClass, Extensions, ScopeType } from './extension.types'
import { ExtensionApolloClientService } from '@dxp/ngx-core/apollo'
import { DxpIContextMessage, DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { Injectable } from '@angular/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'

@Injectable({ providedIn: 'root' })
export class ExtensionService {
  constructor(
    private readonly extensionApolloClientService: ExtensionApolloClientService,
    private readonly luigiService: DxpLuigiContextService,
    private luigiClient: LuigiClient,
  ) {}

  extensionsToQuery = [
    Extensions.CUMULUS,
    Extensions.GITHUB_TOOLS,
    Extensions.JAAS,
    Extensions.PIPER,
    Extensions.STAGING_SERVICE_EXTERNAL,
  ]

  getExtensionClassesForScopesQuery(): Observable<ExtensionClass[]> {
    return combineLatest([this.extensionApolloClientService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([apollo, context]) => {
        return apollo
          .query<{ getExtensionClassesForScopes: ExtensionClass[] }>({
            query: extensionClassesForScopesQuery,
            variables: {
              tenantId: context.context.tenantid,
              types: [ScopeType.GLOBAL, ScopeType.TENANT, ScopeType.PROJECT],
              context: ExtensionService.createGraphqlContextObject(context),
              filter: { excludeHiddenExtensions: true },
            },
            fetchPolicy: 'no-cache',
          })
          .pipe(
            map((apolloResponse) =>
              apolloResponse.data.getExtensionClassesForScopes.filter((extension) =>
                this.extensionsToQuery.find((value) => value == extension.name),
              ),
            ),
          )
      }),
    )
  }

  public getIcon(extension: ExtensionClass): string {
    let isDark = false
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const theme = this.luigiClient.uxManager().getCurrentTheme()

    switch (theme) {
      case 'sap_fiori_3_dark':
      case 'sap_fiori_3_hcb':
      case 'sap_horizon_dark':
        isDark = true
    }

    if (extension.icon) {
      if (isDark) {
        if (extension?.icon?.dark?.url) {
          return extension.icon.dark.url
        }
        if (extension?.icon?.dark?.data) {
          return extension.icon.dark.data
        }
      }

      // Fall back to light icons if no dark icon data was found
      if (extension?.icon?.light?.url) {
        return extension.icon.light.url
      }
      if (extension?.icon?.light?.data) {
        return extension.icon.light.data
      }
    }
    // nothing matched so go with the deprecated image value
    return extension.image
  }

  private static createGraphqlContextObject(context: DxpIContextMessage): {
    entries: { value: string; key: string }[]
  } {
    const entries = [
      {
        key: 'tenant',
        value: context.context.tenantid,
      },
    ]

    if (context.context.projectId) {
      entries.push({
        key: 'project',
        value: context.context.projectId,
      })
    }

    if (context.context.teamId) {
      entries.push({
        key: 'team',
        value: context.context.teamId,
      })
    }

    return {
      entries,
    }
  }
}

const extensionClassesForScopesQuery = gql`
  query getExtensionClassesForScopes(
    $tenantId: String!
    $types: [ScopeType]!
    $context: ScopeContext!
    $filter: ExtensionClassFilter
  ) {
    getExtensionClassesForScopes(tenantId: $tenantId, types: $types, context: $context, filter: $filter) {
      name
      displayName
      image
      provider
      description
      contacts {
        displayName
        email
        role
        contactLink
      }
      preferredSupportChannels {
        URL
        displayName
      }
      serviceLevel
      documentation {
        url
      }
      icon {
        light {
          url
          data
        }
        dark {
          url
          data
        }
      }
    }
  }
`
