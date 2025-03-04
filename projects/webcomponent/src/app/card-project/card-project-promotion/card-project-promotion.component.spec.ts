import { ChangeDetectorRef } from '@angular/core'
import { ExtensionService, ScopeType } from '@dxp/ngx-core/extensions'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { ComponentSearchService } from '@dxp/ngx-core/search'
import { ButtonType, DialogService } from '@fundamental-ngx/core'
import { MockService } from 'ng-mocks'
import { of } from 'rxjs'
import { CardProjectPromotionComponent } from './card-project-promotion.component'
jest.mock('@dxp/ngx-core/luigi-webcomponent', () => ({
  getSrc: jest.fn().mockReturnValue('https://this.is.a.domain/main.js'),
}))
describe('CardProjectPromotionComponent', () => {
  let component: CardProjectPromotionComponent
  let extensionService: ExtensionService
  let componentSearchService: ComponentSearchService
  let luigiContextService: DxpLuigiContextService
  let dialogService: DialogService

  beforeEach(() => {
    extensionService = MockService(ExtensionService)
    componentSearchService = MockService(ComponentSearchService)
    luigiContextService = MockService(DxpLuigiContextService)
    dialogService = MockService(DialogService)
    component = new CardProjectPromotionComponent(
      luigiContextService,
      dialogService,
      componentSearchService,
      extensionService,
      MockService(ChangeDetectorRef),
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call add-members dialog', () => {
    dialogService.open = jest.fn()

    component.openGetStartedModal()
    expect(dialogService.open).toHaveBeenCalled()
  })

  it('should be disabled when no components have been added to the projects', () => {
    componentSearchService.search = jest.fn().mockReturnValue(of({ items: [] }))
    luigiContextService.contextObservable = jest.fn().mockReturnValue(
      of({
        context: {
          entityContext: {
            project: {
              policies: [],
            },
          },
        },
      }),
    )
    component.ngOnInit()
    expect(component.cardButtons).toContainEqual({
      fdType: 'emphasized' as ButtonType,
      clickCallback: component.openGetStartedModal,
      disabled: true,
      tooltip: 'You must first create a component',
      text: 'Set Up',
    })
  })

  it('should update extension instance', () => {
    extensionService.updateExtensionInstanceInProject = jest.fn().mockReturnValue(of({}))
    window.postMessage = jest.fn()
    component.skipCard()
    expect(extensionService.updateExtensionInstanceInProject).toHaveBeenCalledWith({
      installationData: {
        skipOnboardingCard: 'true',
      },
      instanceId: 'pipeline-ui',
      extensionClass: {
        id: 'pipeline-ui',
        scope: ScopeType.PROJECT,
      },
    })
    expect(window.postMessage).toHaveBeenCalledWith({
      msg: 'custom',
      data: { id: 'general.frame-entity-changed' },
    })
  })
})
