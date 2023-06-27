## Documentation of pipeline-ui

**Please fill your documentation here!**

### Setup

1. Clone the repository
2. Login to Artifactory to fetch `@dxp` scoped packages: `yarn login --scope=@dxp --registry=https://common.repositories.cloud.sap/artifactory/api/npm/deploy-releases-hyperspace-npm`
   - how to get token: https://pages.github.tools.sap/Common-Repository/Artifactory-Internet-Facing/setup_access/#cdi-users 
   - set `export PIPER_VAULTCREDENTIAL_ARTIFACTORYTOKEN=` to satisfy `.npmrc` which is required for the piper build.
3. Run `yarn` in the project folder to install the dependencies
4. Run `yarn run start` in the project folder to start the application
5. Visit http://localhost:4200/#/pipeline-ui to view the website standalone
6. You can also visit https://sap.dev.dxp.k8s.ondemand.com/pipeline-ui to view the MFE within DXP
