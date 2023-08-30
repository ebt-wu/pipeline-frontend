## Documentation of pipeline-ui

**Please fill your documentation here!**

## Prequisites
1. [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) 
2. [gcloud cli](https://cloud.google.com/sdk/docs/install)
3. [CAM Profile BTP DXP Developer](https://spc.ondemand.com/sap/bc/webdynpro/a1sspc/cam_wd_central?item=request&profile=BTP%20DXP%20Developer#)

### Setup

1. Clone the repository
2. Login to gcloud - `gcloud auth login` 
3. Export GCP registry reference token: `export GCP_REGISTRY_REFERENCE_TOKEN=$(gcloud auth print-access-token)`
3. [Get identity token from common repository](https://common.repositories.cloud.sap/ui/user_profile) and set it as environment variable to fetch `@dxp` scoped dependencies `export BUILD_SECRETS_ARTIFACTORYTOKEN=<identity token>`.
3. Run `yarn` in the project folder to install the dependencies
4. Run `yarn run start` in the project folder to start the application
5. Visit https://sap.dev.dxp.k8s.ondemand.com navigate to a component and the CI/CD tab to view the MFE within DXP
