import groovy.text.StreamingTemplateEngine

/*
 * Copyright (c) 2018 SAP SE or an SAP affiliate company. All rights reserved.
 */

@Library(['dxp-lib','piper-lib', 'piper-lib-os']) _


def pipelineDefinition = buildPipeline([
        mainBranch: 'main',
        groupId: 'com.sap.dxp/pipelines',
        uis : [
                [
                        name: 'pipeline-ui',
                        packageManager: 'yarn',
                        useRoot: true
                ],
        ],
        versionsFile: "versions.yaml"
])

evaluate(template(pipelineDefinition))

@NonCPS
private String template(def pipelineDefinition) {
    def output = new StreamingTemplateEngine().createTemplate(pipelineDefinition.input).make(pipelineDefinition.bindings)

    echo "Resulting Pipeline: $output"

    return output.toString()
}
