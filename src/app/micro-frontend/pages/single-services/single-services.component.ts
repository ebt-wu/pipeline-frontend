import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-single-services',
  templateUrl: './single-services.component.html',
  standalone: true,
  styleUrls: ['./single-services.component.css'],
  imports: [CommonModule],
})
export class SingleServicesComponent {
  @Input() pipeline$!: Observable<any>
}
