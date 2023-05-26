import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MicroFrontendService } from '../../services/micro-frontend.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  pageTitle = 'pipeline-ui';

  constructor(private microFrontendService: MicroFrontendService) { }
  
  counter: Observable<number>;

  ngOnInit(): void {
    this.counter = this.microFrontendService.getCounter();
  }

  countUp(): void {
    this.microFrontendService.countUp();
  }
}
