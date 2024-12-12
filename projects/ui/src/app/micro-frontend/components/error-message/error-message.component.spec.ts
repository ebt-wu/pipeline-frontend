import { ErrorMessageComponent } from './error-message.component'
import { MockBuilder, MockRender } from 'ng-mocks'
import { ngMocks } from 'ng-mocks'
import { DebugModeService } from '../../services/debug-mode.service'
import { signal } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { GitHubIssueLinkService } from '../../services/github-issue-link.service'

describe('ErrorMessageComponent', () => {
  beforeEach(() =>
    MockBuilder(ErrorMessageComponent)
      .mock(DebugModeService, { debugModeEnabled: signal(false) })
      .mock(DxpLuigiContextService)
      .mock(GitHubIssueLinkService),
  )

  it('should show error message', () => {
    const fixture = MockRender(ErrorMessageComponent, { message: 'Error message' })
    fixture.detectChanges()
    const errorMessageElement = ngMocks.find<HTMLElement>(fixture.debugElement, '.message-font')
    expect((errorMessageElement.nativeElement as HTMLElement).textContent).toEqual('Error message')
  })

  it('should show error message with link', () => {
    const errorCode = 'JENKINS-PIPELINE-10'
    const fixture = MockRender(ErrorMessageComponent, { message: `${errorCode}: Error message` })
    const errorMessageElement = ngMocks.find<HTMLElement>(fixture, '.message-font')
    const link = ngMocks.find<HTMLAnchorElement>(fixture, 'a')
    expect(errorMessageElement).toBeTruthy()
    expect(link).toBeTruthy()
    expect(errorMessageElement).toBeDefined()
    expect(link).toBeDefined()
    expect((errorMessageElement.nativeElement as HTMLElement).textContent).toContain('Error message')
    expect((errorMessageElement.nativeElement as HTMLElement).textContent).toContain(errorCode)
    expect((link.nativeElement as HTMLAnchorElement).href).toContain(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/build/jenkins.html#required-permissions',
    )
  })

  it('should set troubleshootContext on init if error code is present', () => {
    const errorCode = 'GITHUB-ACTION-6'
    const fixture = MockRender(ErrorMessageComponent, { message: `${errorCode}: Error message` })
    const component = fixture.point.componentInstance
    component.ngOnInit()
    expect(component.troubleshootContext()).toEqual({
      docUrl:
        'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/how-tos/use-github-PAT.html#replacing-an-invalid-personal-access-token',
    })
  })

  it('should not set troubleshootContext on init if error code is not present', () => {
    const fixture = MockRender(ErrorMessageComponent, { message: 'Error message' })
    const component = fixture.point.componentInstance
    component.ngOnInit()
    expect(component.troubleshootContext()).toBeUndefined()
  })
})
