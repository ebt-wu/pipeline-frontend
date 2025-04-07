import { KindExtensionName } from '@constants'
import { Kinds } from '@enums'
import { FormGeneratorService } from '@fundamental-ngx/platform/form'
import { MockBuilder, MockInstance, MockRender, ngMocks } from 'ng-mocks'
import { of } from 'rxjs'
import { SonarService } from '../../../services/sonar.service'
import { StaticCodeChecksComponent } from './static-code-checks.component'

describe('StaticCodeChecksComponent', () => {
  beforeEach(() => {
    ngMocks.reset()
    jest.resetAllMocks()
    return MockBuilder(StaticCodeChecksComponent).mock(FormGeneratorService)
  })

  it('should create', () => {
    const fixture = MockRender(StaticCodeChecksComponent)
    const component = fixture.point.componentInstance
    expect(component).toBeTruthy()
  })

  it('should have a SonarQube extension-info tile with a popover config', () => {
    const fixture = MockRender(StaticCodeChecksComponent)
    const component = fixture.point.componentInstance

    const extensionInfoFormItem = component.formItems.find((item) => item['type'] === 'extension-info')
    expect(extensionInfoFormItem).toBeTruthy()
    expect(extensionInfoFormItem['guiOptions']['additionalData'].extensionName).toEqual(
      KindExtensionName[Kinds.SONAR_QUBE_PROJECT],
    )
    expect(extensionInfoFormItem['guiOptions']['additionalData'].popoverHtml).toBeTruthy()
  })

  it('calling onFormSubmitted should call createSonarQubeProject from sonarService HSOBRD-128', () => {
    const sonarServiceCreateSpy = jest.fn().mockReturnValue(of({}))
    MockInstance(SonarService, 'createSonarqubeProject', sonarServiceCreateSpy)
    const fixture = MockRender(StaticCodeChecksComponent)
    const component = fixture.point.componentInstance
    fixture.detectChanges()

    component.onFormSubmitted({
      sonarProjectName: 'test-project',
    })
    expect(sonarServiceCreateSpy).toHaveBeenCalledWith('test-project')
  })
})
