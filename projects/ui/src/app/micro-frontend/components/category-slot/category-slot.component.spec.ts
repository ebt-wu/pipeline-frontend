import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CategorySlotComponent } from './category-slot.component'
import { AuthorizationTestingModule } from '@dxp/ngx-core/authorization'
import { Categories, ServiceStatus } from '@enums'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

describe('CategorySlotComponent', () => {
  let component: CategorySlotComponent
  let fixture: ComponentFixture<CategorySlotComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorySlotComponent, AuthorizationTestingModule.withDefaultPolicies(['owner'])],
    }).compileComponents()

    fixture = TestBed.createComponent(CategorySlotComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
  it('should show the category', () => {
    component.category = Categories.COMPLIANCE
    fixture.detectChanges()
    const componentHTML: HTMLElement = fixture.nativeElement
    const category = componentHTML.querySelector('.category-name')
    expect(category).toBeTruthy()
    expect(category.textContent.trim()).toEqual(Categories.COMPLIANCE)
  })

  it('should show the category with configured services text', () => {
    component.category = Categories.COMPLIANCE
    component.configuredServicesText = 'Configured Services'
    fixture.detectChanges()
    const componentHTML: HTMLElement = fixture.nativeElement
    const category = componentHTML.querySelector('.category-name')
    expect(category).toBeTruthy()
    expect(category.textContent.trim()).toContain(Categories.COMPLIANCE)

    const configuredServicesElement = componentHTML.querySelector('.category-details')
    expect(configuredServicesElement).toBeTruthy()
    expect(configuredServicesElement.textContent.trim()).toEqual(component.configuredServicesText)
  })

  it('should show a button with the provided text if isButtonShown is provided', () => {
    const buttonActionMock = jest.fn()
    component.buttonConfig = {
      isButtonShown: true,
      isButtonDisabled: false,
      disabledButtonInlineHelpText: undefined,
      buttonText: 'Button Text',
      buttonAction: buttonActionMock,
    }
    component.statusIconConfig = {
      statusIconType: ServiceStatus.CREATED,
    }
    fixture.detectChanges()
    const componentHTML: HTMLElement = fixture.nativeElement
    const button = componentHTML.querySelector('button')
    expect(button).toBeTruthy()
    expect(button.textContent.trim()).toEqual('Button Text')
    button.click()
    expect(buttonActionMock).toHaveBeenCalled()
  })
  it('should not show a button if the user doesnt have owner, member or vault-maintainer policies', async () => {
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [CategorySlotComponent, AuthorizationTestingModule.withDefaultPolicies([])], // mock that user has no policies
    }).compileComponents()

    component.buttonConfig = {
      isButtonShown: true,
      isButtonDisabled: false,
      disabledButtonInlineHelpText: undefined,
      buttonText: 'Button Text',
      buttonAction: jest.fn(),
    }
    fixture.detectChanges()
    const componentHTML: HTMLElement = fixture.nativeElement
    const button = componentHTML.querySelector('button')
    expect(button).toBeFalsy()
  })

  it('should show a status tag with the provided text if isStatusTagShown is provided', () => {
    component.statusTagConfig = {
      isStatusTagShown: true,
      statusTagText: 'Label Text',
    }
    fixture.detectChanges()
    const componentHTML: HTMLElement = fixture.nativeElement
    const label = componentHTML.querySelector('fd-info-label')
    expect(label).toBeTruthy()
    expect(label.textContent.trim()).toEqual('Label Text')
  })
  it('should not show a status tag if statusTagConfig is not provided', () => {
    component.statusTagConfig = undefined
    fixture.detectChanges()
    const componentHTML: HTMLElement = fixture.nativeElement
    const label = componentHTML.querySelector('fd-info-label')
    expect(label).toBeFalsy()
  })
})
