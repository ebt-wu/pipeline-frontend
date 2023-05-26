import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { DynatraceConfigurationService } from '@dxp/ngx-core/dynatrace';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then((ref) => {
      const dynatraceConfigurationService = ref.injector.get(
          DynatraceConfigurationService
      );
      dynatraceConfigurationService
          .injectScript('')
          .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
