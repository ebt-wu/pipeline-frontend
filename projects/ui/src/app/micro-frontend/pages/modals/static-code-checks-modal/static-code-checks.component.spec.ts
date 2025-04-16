import { KindExtensionName } from '@constants'
import { Kinds, StepKey } from '@enums'
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

  it('should have usingCAPMTA header', () => {
    const fixture = MockRender(StaticCodeChecksComponent)
    const component = fixture.point.componentInstance
    jest.spyOn(component, 'isCapMtaSetupStep').mockReturnValue(true)
    const header = component.formItems.find((item) => item['type'] === 'header')
    expect(header).toBeTruthy()
    expect(header['guiOptions']['additionalData'].headerText).toEqual('Because you use CAP (MTA)')
    expect(header['when']()).toEqual(true)
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
    expect(extensionInfoFormItem['guiOptions']['additionalData'].popoverHtml()).toContain('</a>')
    jest.spyOn(component, 'isCapMtaSetupStep').mockReturnValue(false)
    jest.spyOn(component, 'isNoCapMtaSetupStep').mockReturnValue(true)
    expect(extensionInfoFormItem['when']()).toEqual(true)
  })

  it('should have a ESLint extension-info tile with a popover config', () => {
    const fixture = MockRender(StaticCodeChecksComponent)
    const component = fixture.point.componentInstance

    const extensionInfoFormItem = component.formItems.find((item) => {
      if (item['type'] === 'extension-info') {
        return item['guiOptions']['additionalData'].extensionName === KindExtensionName[StepKey.ES_LINT]
      }
    })
    expect(extensionInfoFormItem).toBeTruthy()
    expect(extensionInfoFormItem['guiOptions']['additionalData'].extensionName).toEqual(
      KindExtensionName[StepKey.ES_LINT],
    )
    expect(extensionInfoFormItem['guiOptions']['additionalData'].popoverHtml).toBeTruthy()
    expect(extensionInfoFormItem['guiOptions']['additionalData'].popoverHtml()).toContain('</a>')
    jest.spyOn(component, 'isCapMtaSetupStep').mockReturnValue(true)
    expect(extensionInfoFormItem['when']()).toEqual(true)
  })

  it('should have hacky workaround padding', () => {
    const fixture = MockRender(StaticCodeChecksComponent)
    const component = fixture.point.componentInstance

    const header = component.formItems.find((item) => {
      if (item['type'] === 'header') {
        return item['name'] === 'setUpSonarQubeHeaderPadding'
      }
    })
    expect(header).toBeTruthy()
    jest.spyOn(component, 'isCapMtaSetupStep').mockReturnValue(false)
    jest.spyOn(component, 'isNoCapMtaSetupStep').mockReturnValue(true)
    expect(header['when']()).toEqual(true)
  })

  it('should have setUpSonarQube Header', () => {
    const fixture = MockRender(StaticCodeChecksComponent)
    const component = fixture.point.componentInstance

    const header = component.formItems.find((item) => {
      if (item['type'] === 'header') {
        return item['name'] === 'setUpSonarQubeHeader'
      }
    })
    expect(header).toBeTruthy()
    expect(header['guiOptions']['additionalData'].headerText).toEqual('1. Set up SonarQube')
    jest.spyOn(component, 'isCapMtaSetupStep').mockReturnValue(true)
    expect(header['when']()).toEqual(true)
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

  describe('tests for cap Mta form step', () => {
    it('should have setUpSonarQubeCap header', () => {
      const fixture = MockRender(StaticCodeChecksComponent)
      const component = fixture.point.componentInstance
      jest.spyOn(component, 'isCapMtaSetupStep').mockReturnValue(true)
      const header = component.usingCAPMTA.find((item) => item['type'] === 'header')
      expect(header).toBeTruthy()
      expect(header['guiOptions']['additionalData'].headerText).toEqual('Are you using CAP (MTA) on this component?')
      expect(header['when']()).toEqual(true)
    })
    it('should have the radio buttons', () => {
      const fixture = MockRender(StaticCodeChecksComponent)
      const component = fixture.point.componentInstance
      jest.spyOn(component, 'isCapMtaSetupStep').mockReturnValue(true)
      const radio = component.usingCAPMTA.find((item) => item['type'] === 'radio')
      expect(radio).toBeTruthy()
      expect(radio['name']).toEqual('setUpSonarQubeCapChoice')
      expect(radio['default']()).toEqual('')
      expect(radio['when']()).toEqual(true)
    })
  })
})
