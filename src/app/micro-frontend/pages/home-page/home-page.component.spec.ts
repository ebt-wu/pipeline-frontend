import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform';
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { MockModule, MockProvider } from 'ng-mocks';
import { MicroFrontendService } from '../../services/micro-frontend.service';
import { HomePageComponent } from "./home-page.component";

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  let microFrontendService: MicroFrontendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomePageComponent,
      ],
      providers: [
        MockProvider(MicroFrontendService, {
          getCounter: jest.fn().mockReturnValue(EMPTY),
          countUp: jest.fn()
        }),
      ],
      imports: [
        MockModule(FundamentalNgxCoreModule),
        MockModule(FundamentalNgxPlatformModule),
      ],
    }).compileComponents();

    microFrontendService = TestBed.inject(MicroFrontendService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should match snapshot', () => {
    expect(require('./home-page.component.html')).toMatchSnapshot();
  });

  it('should delegate counting up', () => {
    component.countUp();

    expect(microFrontendService.countUp).toHaveBeenCalledTimes(1);
  })
});
