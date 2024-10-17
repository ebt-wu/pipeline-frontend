import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { Kinds, StepKey } from '@enums'

interface SelectedResourceData {
  kind: Kinds | StepKey
  name: string
}

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  selectedResourceData$: Observable<SelectedResourceData>
  private resourceDataSubject = new BehaviorSubject<SelectedResourceData>(null)
  constructor() {
    this.selectedResourceData$ = this.resourceDataSubject.asObservable()
  }

  publishResourceData(kind: Kinds | StepKey, name: string) {
    this.resourceDataSubject.next({ kind, name })
  }
}
