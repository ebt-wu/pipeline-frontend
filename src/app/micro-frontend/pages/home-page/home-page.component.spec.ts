import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { EMPTY } from 'rxjs'
import { MockModule, MockProvider, MockService } from 'ng-mocks'
import { MicroFrontendService } from '../../services/micro-frontend.service'
import { HomePageComponent } from './home-page.component'

describe('HomePageComponent', () => {
  let component: HomePageComponent
  let fixture: ComponentFixture<HomePageComponent>

  let microFrontendService: MicroFrontendService

  beforeEach(() => {
    microFrontendService = MockService(MicroFrontendService, {
      getCounter: jest.fn().mockReturnValue(EMPTY),
      countUp: jest.fn(),
    })

    component = new HomePageComponent(microFrontendService)
  })

  it('should delegate counting up', () => {
    component.countUp()

    expect(microFrontendService.countUp).toHaveBeenCalledTimes(1)
  })
})
