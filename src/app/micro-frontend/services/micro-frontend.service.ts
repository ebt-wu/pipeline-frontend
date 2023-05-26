import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})  
export class MicroFrontendService {
  counter: BehaviorSubject<number>;

  constructor() {
    this.counter = new BehaviorSubject<number>(0);
  }

  getCounter(): Observable<number> {
    return this.counter.asObservable();
  }

  countUp() {
    this.counter.next(this.counter.getValue() + 1);
  }
}