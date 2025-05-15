import { LuigiClient } from '@dxp/ngx-core/luigi'
import { MockBuilder, MockRender } from 'ng-mocks'
import { StaticCodeChecksNoBuildModalComponent } from './static-code-checks-no-build-modal.component'

describe('StaticCodeChecksNoBuildModalComponent', () => {
  const closeModalSpy = jest.fn()
  const openSetupBuildModalSpy = jest.fn()
  beforeEach(() => {
    return MockBuilder(StaticCodeChecksNoBuildModalComponent).mock(LuigiClient, {
      uxManager: jest.fn().mockReturnValue({
        closeCurrentModal: closeModalSpy,
      }),
      linkManager: jest.fn().mockReturnValue({
        fromVirtualTreeRoot: jest.fn().mockReturnValue({
          openAsModal: openSetupBuildModalSpy,
        }),
      }),
    })
  })
  it('should create', () => {
    const fixture = MockRender(StaticCodeChecksNoBuildModalComponent)
    const component = fixture.point.componentInstance
    expect(component).toBeTruthy()
  })
  it('calling closeDialog should close the modal', () => {
    const fixture = MockRender(StaticCodeChecksNoBuildModalComponent)
    const component = fixture.point.componentInstance
    component.closeDialog()
    expect(closeModalSpy).toHaveBeenCalled()
  })
  it('calling openSetupBuildModal should open the setup build modal', async () => {
    const fixture = MockRender(StaticCodeChecksNoBuildModalComponent)
    const component = fixture.point.componentInstance
    await component.openSetupBuildModal()

    expect(openSetupBuildModalSpy).toHaveBeenCalledWith('setup', {
      height: '44rem',
      width: '36rem',
      title: 'Set up Build Pipeline',
    })
  })
  it('calling openDocumentation should open the sonar link', () => {
    const fixture = MockRender(StaticCodeChecksNoBuildModalComponent)
    const component = fixture.point.componentInstance
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null as unknown as Window)
    component.openDocumentation()
    expect(openSpy).toHaveBeenCalledWith(component.SONARQUBE_DOCU_LINK, '_blank', 'noopener noreferrer')
  })
})
