import { ServiceStatus, StepKey } from '@enums'
import { CategorySlotConfigService } from './category-slot-config.service'

describe('generateNotManagedServicesConfig', () => {
  it('should make the tooltip for one service', () => {
    const notManagedRefs = [{ kind: StepKey.CX_ONE, status: ServiceStatus.NOT_MANAGED }]
    expect(CategorySlotConfigService.generateNotManagedTooltip(notManagedRefs)).toEqual(
      "Checkmarx ONE is not available in the Hyperspace Portal. Your setup can't be managed or edited from here.",
    )
  })
  it('should make the tooltip for two services with an and separating them', () => {
    const notManagedRefs = [
      { kind: StepKey.CX_ONE, status: ServiceStatus.NOT_MANAGED },
      {
        kind: StepKey.CHECKMARX,
        status: ServiceStatus.NOT_MANAGED,
      },
    ]
    expect(CategorySlotConfigService.generateNotManagedTooltip(notManagedRefs)).toEqual(
      "Checkmarx ONE and Checkmarx are not available in the Hyperspace Portal. Your setup can't be managed or edited from here.",
    )
  })
  it('should make the tooltip for three services with a comma and and separating them', () => {
    const notManagedRefs = [
      { kind: StepKey.CX_ONE, status: ServiceStatus.NOT_MANAGED },
      { kind: StepKey.CHECKMARX, status: ServiceStatus.NOT_MANAGED },
      { kind: StepKey.FORTIFY, status: ServiceStatus.NOT_MANAGED },
    ]
    expect(CategorySlotConfigService.generateNotManagedTooltip(notManagedRefs)).toEqual(
      "Checkmarx ONE, Checkmarx and Fortify are not available in the Hyperspace Portal. Your setup can't be managed or edited from here.",
    )
  })
})
