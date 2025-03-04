import { Pipe, PipeTransform } from '@angular/core'
import { KindStage } from '@constants'
import { Stages } from '@enums'
import { ResourceRef } from '@types'

@Pipe({
  name: 'resourceStage',
  standalone: true,
})
/**
 *  Pipe to filter the resourceRefs into their respective stages
 *
 *  Usage example to get only resourceRefs belonging to the build stage:
 *
 *  <div *ngFor= "let ref of (resourceRefs | resourceStage : Stages.BUILD)"> ...
 */
export class ResourceStagePipe implements PipeTransform {
  transform(value: ResourceRef[], stage: Stages): ResourceRef[] | null {
    return value.filter((ref) => KindStage[ref.kind] === stage)
  }
}
