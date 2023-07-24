import { Categories, Kinds } from './enums';

export enum PipelineType {
    FULL_PIPELINE = "FULL_PIPELINE",
    SINGLE_SERVICE = "SINGLE_SERVICE"
}

const kindName = {};
kindName[Kinds.CUMULUS_PIPELINE] = 'Cumulus';
kindName[Kinds.GITHUB_REPOSITORY] = 'GitHub Repository';
kindName[Kinds.PIPER_CONFIG] = 'Piper Configuration';
kindName[Kinds.STAGING_SERVICE_CREDENTIAL] = 'Staging Service';
export const KindName = kindName;

const kindCategory = {};
kindCategory[Kinds.CUMULUS_PIPELINE] = Categories.COMPLIANCE;
kindCategory[Kinds.GITHUB_REPOSITORY] = Categories.SOURCE_CODE_MANAGEMENT;
kindCategory[Kinds.STAGING_SERVICE_CREDENTIAL] = Categories.ARTEFACTS;
export const KindCategory = kindCategory;

const kindDocumentation = {};
kindDocumentation[Kinds.CUMULUS_PIPELINE] = 'https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/cumulus.html#cumulus';
kindDocumentation[Kinds.GITHUB_REPOSITORY] = 'https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/staging-service.html#staging-service';
kindDocumentation[Kinds.GITHUB_REPOSITORY] = 'https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/github.html#github';
export const KindDocumentation = kindDocumentation;
