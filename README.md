## Documentation of pipeline-ui

**Please fill your documentation here!**

## Prequisites
1. [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) 
2. [gcloud cli](https://cloud.google.com/sdk/docs/install)
3. [CAM Profile BTP DXP Developer](https://spc.ondemand.com/sap/bc/webdynpro/a1sspc/cam_wd_central?item=request&profile=BTP%20DXP%20Developer#)

### Setup

1. Clone the repository
2. Run `./setup.sh`
3. Run `yarn` in the project folder to install the dependencies
4. Run `yarn start` in the project folder to start the application
5. Visit https://portal.d1.hyperspace.tools.sap navigate to a component and the CI/CD tab to view the MFE within DXP

### FAQ

> I am trying to visit my site on `http://localhost:4200` but it only shows a blank screen.

This is intended behaviour as the Microfrontend can only work, if a Luigi-Core frame is available. So please make sure to open your local development environment from within the Portal directly as described in step 5 of the setup guide

