import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { ServiceStatus } from '@enums'
import { StatusIconComponent } from './status-icon.component'

describe('StatusIconComponent', () => {
  let component: StatusIconComponent
  let fixture: ComponentFixture<StatusIconComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusIconComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusIconComponent)
    component = fixture.componentInstance
  })

  it('should display green check icon when status is CREATED', async () => {
    component.statusIconConfig = { statusIconType: ServiceStatus.CREATED }
    fixture.detectChanges()
    await fixture.whenRenderingDone()
    const icon = fixture.debugElement.query(By.css('[data-testid="status-icon-green-check"]'))
    expect(icon).toBeTruthy()
  })

  it('should display loading indicator when status is PENDING_CREATION', async () => {
    component.statusIconConfig = { statusIconType: ServiceStatus.PENDING_CREATION }
    fixture.detectChanges()
    await fixture.whenRenderingDone()
    const icon = fixture.debugElement.query(By.css('[data-testid="status-icon-loading"]'))
    expect(icon).toBeTruthy()
  })

  it('should display red x icon when status is FAILING_CREATION', async () => {
    component.statusIconConfig = { statusIconType: ServiceStatus.FAILING_CREATION }
    fixture.detectChanges()
    await fixture.whenRenderingDone()
    const icon = fixture.debugElement.query(By.css('[data-testid="status-icon-red-x"]'))
    expect(icon).toBeTruthy()
  })

  it('should display alert icon when status is ALERT', async () => {
    component.statusIconConfig = { statusIconType: 'ALERT' }
    fixture.detectChanges()
    await fixture.whenRenderingDone()
    const icon = fixture.debugElement.query(By.css('[data-testid="status-icon-alert"]'))
    expect(icon).toBeTruthy()
  })

  it('should display question mark icon when status is NOT_MANAGED', async () => {
    component.statusIconConfig = { statusIconType: ServiceStatus.NOT_MANAGED }
    fixture.detectChanges()
    await fixture.whenRenderingDone()
    const icon = fixture.debugElement.query(By.css('[data-testid="status-icon-question-mark"]'))
    expect(icon).toBeTruthy()
  })

  it('should display circle icon when status is NOT_FOUND', async () => {
    component.statusIconConfig = { statusIconType: ServiceStatus.NOT_FOUND }
    fixture.detectChanges()
    await fixture.whenRenderingDone()
    const icon = fixture.debugElement.query(By.css('[data-testid="status-icon-circle"]'))
    expect(icon).toBeTruthy()
  })

  it('should not display any icon when statusIconConfig is null', async () => {
    component.statusIconConfig = null
    fixture.detectChanges()
    await fixture.whenRenderingDone()
    const icons = fixture.debugElement.queryAll(By.css('.status-icon'))
    expect(icons.length).toBe(0)
  })
})
