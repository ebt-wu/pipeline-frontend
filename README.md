## The Hyperspace CI/CD Setup frontend

 * **🔨 Infrastructure** [ci-cd-setup-stack](https://github.tools.sap/hyperspace/ci-cd-setup-stack).
 * **🐞 Tickets** go into [hyperspace/yggdrasil/issues](https://github.tools.sap/hyperspace/yggdrasil/issues).
 * **🎒 Backend** is in [pipeline-backend](https://github.tools.sap/hyperspace/pipeline-backend).
 
## Prequisites

1. [yarn](https://yarnpkg.com/getting-started/install)

### Setup

1. Clone the repository
2. Run `yarn` in the project folder to install the dependencies
3. Run one of the following commands in the project folder
   - `yarn start:ui` to start the application
   - `yarn start:ui-local` to start the application with the local pipeline-backend
   - `yarn start:wc` to start the webcomponents (cards, dialogs on component and pipeline landing pages)
   - `yarn start:wc-local` to start the webcomponents (cards, dialogs on component and pipeline landing pages) with the local pipeline backend
4. Visit https://portal.d1.hyperspace.tools.sap navigate to a component and the CI/CD tab to view the MFE within DXP

### FAQ

> I am trying to visit my site on `http://localhost:4200` but it only shows a blank screen.

This is intended behaviour as the Microfrontend can only work, if a Luigi-Core frame is available. So please make sure to open your local development environment from within the Portal directly as described in step 5 of the setup guide

> Hyperspace Portal dev (portal.d1.hyperspace.tools.sap) is facing issues. Can I also develop against another landscape like portal.i1.hyperspace.tools.sap?

Yes, you can enable dev mode on any other landscape by running a command like:

```javascript
localStorage.setItem(
  'dxp-dev-mode-settings',
  JSON.stringify({
    isActive: true,
    cdm: [{ url: 'http://localhost:4201/assets/cdm.json' }],
  }),
)
```

in the browser console.
