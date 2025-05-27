{{- define "ui.cdm" }}
{{ $url := printf "%s://%s" .Values.protocol .Values.site.domain -}}
{{ $pipelineUIPath := printf "%s/browser/{i18n.currentLocale}/#/pipeline-ui" $url -}}
{
  "_version": "3.0",
  "payload": {
    "visualizations": {
      "LuigiNavConfig": {
        "vizType": "sap.luigi.node",
        "vizConfig": {
          "viewGroup": {
            "preloadSuffix": "/#/preload"
          },
          "nodes": [
            {
              "pathSegment": "pipeline-ui",
              "label": "CI/CD Setup",
              "url": "{{$pipelineUIPath}}",
              "hideSideNav": false,
              "icon": "process",
              "entityType": "project.component",
              "virtualTree": true,
              "requiredIFramePermissions": {
                "allow": ["clipboard-read", "clipboard-write"]
              },
              {{- with .Values.features }}
              "context": {
                "featureFlags": {{ . | toJson }}
              },
              {{- end}}
              "children": [
                {
                  "pathSegment": "setup",
                  "entityType": "project.component",
                  "url": "{{$pipelineUIPath}}/setup",
                  "hideSideNav": false
                },
                {
                  "pathSegment": "pipeline-debug",
                  "entityType": "project.component",
                  "url": "{{$pipelineUIPath}}/pipeline-debug",
                  "hideSideNav": false
                },
                {
                  "pathSegment": "feedback",
                  "entityType": "project.component",
                  "url": "{{$pipelineUIPath}}/feedback",
                  "hideSideNav": false
                },
                {
                  "pathSegment": "import-pipeline",
                  "entityType": "project.component",
                  "url": "{{$pipelineUIPath}}/import-pipeline",
                  "hideSideNav": false
                },
                {
                  "pathSegment": "cumulus-info",
                  "entityType": "project.component",
                  "urlSuffix": "{{$pipelineUIPath}}/cumulus-info",
                  "hideSideNav": false
                }
              ]
            },
            {
              "pathSegment": "modal",
              "entityType": "project.component",
              "url": "{{$url}}/browser/{i18n.currentLocale}/#/modal",
              "hideSideNav": false
            }
          ]
        }
      }
    },
    "targetAppConfig": {
      "_version": "1.13.0",
      "sap.integration": {
        "navMode": "inplace",
        "urlTemplateId": "urltemplate.url",
        "urlTemplateParams": {
          "query": {}
        }
      }
    }
  },
  "texts": [
    {
      "locale": "",
      "textDictionary": {
        "pipeline-ui": "pipeline-ui"
      }
    },
    {
      "locale": "en",
      "textDictionary": {
        "pipeline-ui": "pipeline-ui"
      }
    },
    {
      "locale": "de",
      "textDictionary": {
        "pipeline-ui": "pipeline-ui"
      }
    }
  ]
}
{{- end }}