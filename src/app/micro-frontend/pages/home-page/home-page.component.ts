import { Observable, Subject } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MicroFrontendService } from '../../services/micro-frontend.service';
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
    pageTitle = 'pipeline-ui';

    constructor(
        private microFrontendService: MicroFrontendService,
        private luigiContextService: DxpLuigiContextService
    ) {}

    counter: Observable<number>;
    userId: Subject<string> = new Subject();

    async ngOnInit(): Promise<void> {
        this.counter = this.microFrontendService.getCounter();

        const context = await this.luigiContextService.getContextAsync();

        const result = await fetch('http://localhost:3000/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${context.token}`,
            },
            body: JSON.stringify({
                query: `query Version($projectId: String!){version(projectId: $projectId)}`,
                variables: {
                    projectId: context.projectId,
                },
            }),
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { data } = await result.json();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
        this.userId.next(data.version);
    }

    countUp(): void {
        this.microFrontendService.countUp();
    }
}
