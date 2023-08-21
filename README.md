## Documentation of pipeline-ui

**Please fill your documentation here!**

## Prequisites
1. [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) 
2. [gcloud cli](https://cloud.google.com/sdk/docs/install)

### Setup

1. Clone the repository
2. Login to gcloud - `yarn run login-gcloud`
3. [Get identity token from common repository](https://common.repositories.cloud.sap/ui/user_profile) and set it as environment variable to fetch `@dxp` scoped dependencies `export BUILD_SECRETS_ARTIFACTORYTOKEN=<identity token>`.
3. Run `yarn` in the project folder to install the dependencies
4. Run `yarn run start` in the project folder to start the application
5. Visit http://localhost:4200/#/pipeline-ui to view the website standalone
6. You can also visit https://sap.dev.dxp.k8s.ondemand.com/pipeline-ui to view the MFE within DXP
