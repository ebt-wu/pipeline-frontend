import { fakeAsync, tick } from "@angular/core/testing";
import { MicroFrontendService } from "./micro-frontend.service";

describe('MicroFrontendService', () => {
  let microFrontendService: MicroFrontendService;

  beforeEach(() => {
    microFrontendService = new MicroFrontendService();
  });

  it('should provide a counter with an initial value', () => {
    let count: number;

    microFrontendService.getCounter().subscribe(c => count = c);

    expect(count).toEqual(0);
  });

  it('should provide an interactive counter', fakeAsync(() => {
    let count: number;

    microFrontendService.getCounter().subscribe(c => count = c);
    microFrontendService.countUp();
    tick();

    expect(count).toEqual(1);
  }));
});