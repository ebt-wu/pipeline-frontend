import { Injectable } from '@angular/core'
import { GithubRegistration, GithubService as DXPGithubService } from '@dxp/ngx-core/github'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  constructor(private githubService: DXPGithubService) {}

  public getGithubAccounts(): Observable<GithubRegistration[]> {
    return this.getAccounts().pipe(map((accounts) => accounts.filter((account) => account.installation)))
  }

  private getAccounts(): Observable<GithubRegistration[]> {
    return this.githubService.getGithubAppRegistrations<GithubRegistration[]>(
      `name
    installation {
      name
      account {
        login,
        domain
      }
    }`,
    )
  }
}
