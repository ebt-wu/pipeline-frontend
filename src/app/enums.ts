export enum Kinds {
    GITHUB_REPOSITORY = 'GithubRepository',
    STAGING_SERVICE_CREDENTIAL = 'StagingServiceCredential',
    CUMULUS_PIPELINE = 'CumulusPipeline',
    PIPER_CONFIG = 'PiperConfig',
    JENKINS_PIPELINE = 'JenkinsPipeline'
}

export enum Categories {
    SOURCE_CODE_MANAGEMENT = 'Source Code Management',
    COMPLIANCE = 'Compliance',
    ARTEFACTS = 'Artefacts',
    ORCHESTRATION = 'Orchestration',
    CICD_TURNKEY_SOLUTION = 'CI/CD Turnkey Solution'
}

export enum PipelineType {
    FULL_PIPELINE = "FULL_PIPELINE",
    SINGLE_SERVICE = "SINGLE_SERVICE"
}

export enum BuildTools {
    DOCKER = "Docker",
    GRADLE = "Gradle",
    NPM = "npm",
    MAVEN = "Maven",
    PYTHON = "Python",
    MTA = "mta",
    GO = "Golang"
}

export enum Languages {
    JAVA = "Java",
    GO = "Go",
    TYPESCRIPT = "TypeScript",
    JAVASCRIPT = "JavaScript",
    PYTHON = "Python",
    DOCKERFILE = "Dockerfile"
}

export enum Orchestrators {
    JENKINS = "Jenkins",
    AZURE_PIPELINES = "Azure Pipelines",
    GITHUB_ACTIONS = "Github Actions"
}

export enum CredentialTypes {
    EXISTING = 'Use Existing',
    NEW = 'Enter New'
}
