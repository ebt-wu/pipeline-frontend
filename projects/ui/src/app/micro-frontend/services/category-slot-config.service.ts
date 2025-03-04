import { KindName } from '@constants'
import { ServiceStatus } from '@enums'
import { ResourceRef } from '@types'

/**
 * Helpers for configuring the category slot which are not category-specific
 */
export class CategorySlotConfigService {
  static generateNotManagedTooltip(steps: ResourceRef[]) {
    const notManagedStepNames = steps
      .filter((ref) => ref.status === ServiceStatus.NOT_MANAGED)

      .map((ref) => KindName[ref.kind])

    if (notManagedStepNames.length === 0) {
      return null
    }

    let tooltipText = ''
    if (notManagedStepNames.length === 1) {
      tooltipText =
        notManagedStepNames[0] +
        " is not available in the Hyperspace Portal. Your setup can't be managed or edited from here."
    } else if (notManagedStepNames.length > 1) {
      // join all names with a comma but the last one with and
      tooltipText =
        notManagedStepNames.slice(0, -1).join(', ') +
        ' and ' +
        notManagedStepNames.slice(-1).toString() +
        " are not available in the Hyperspace Portal. Your setup can't be managed or edited from here."
    }
    return tooltipText
  }
}
