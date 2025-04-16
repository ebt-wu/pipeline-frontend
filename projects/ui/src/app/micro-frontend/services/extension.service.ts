import { Injectable } from '@angular/core'
import { ExtensionApolloClientService } from '@dxp/ngx-core/apollo'
import { DxpIContextMessage, DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { gql } from 'apollo-angular'
import { combineLatest, first, map, mergeMap, Observable } from 'rxjs'
import { eslintSvg } from '../../../assets/ts-svg/eslint'
import { ExtensionClass, ScopeType } from './extension.types'

@Injectable({ providedIn: 'root' })
export class ExtensionService {
  constructor(
    private readonly extensionApolloClientService: ExtensionApolloClientService,
    private readonly luigiService: DxpLuigiContextService,
    private luigiClient: LuigiClient,
  ) {}

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
            map((apolloResponse) => {
              // adding eslint data to the list of extensions further explanation down below
              return this.addEslintData(apolloResponse.data.getExtensionClassesForScopes)
            }),
          )
      }),
    )
  }

  // ESlint is not an extension but we need to add it to the list of extensions because we want to show the information in
  // the UI. As this is not a service offered by Hyperspace and hardcoding it in the component file(s) was more hacky and a tad
  // bit more complex we decided to add it here so we have a single source of information and later on if we add service description
  // for eslint we can simply add it here and not have to changes in the code files(static-code-checks.component.html/ts)
  eslintData: ExtensionClass = {
    name: 'eslint',
    displayName: 'ESLint',
    image: '',
    description: 'ESLint is a static code analysis tool for identifying problematic patterns in JavaScript code.',
    documentation: {
      url: null,
    },
    icon: {
      light: {
        url: null,
        data: eslintSvg,
      },
      dark: {
        url: null,
        data: eslintSvg,
      },
    },
  }

  private addEslintData(data: ExtensionClass[]): ExtensionClass[] {
    const eslintData = this.eslintData
    data.push(eslintData)
    return data
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
