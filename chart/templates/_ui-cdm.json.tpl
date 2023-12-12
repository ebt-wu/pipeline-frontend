{{- define "ui.cdm" }}
{{ $url := printf "%s://%s" .Values.protocol .Values.site.domain -}}
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
              "url": "{{$url}}/{i18n.currentLocale}/#/pipeline-ui",
              "hideSideNav": false,
              "icon": "process",
              "entityType": "project.component",
              "virtualTree": true,
              "requiredIFramePermissions": {
                "allow": ["clipboard-read", "clipboard-write"]
              },
              {{- if eq .Values.environment "live" }}
              "visibleForContext": "contains({{ .Values.enabledProjects | toJson | replace "\"" "'" }}, entityContext.project.id)",
              {{- end }}
              "children": [
                {
                  "pathSegment": "setup",
                  "entityType": "project.component",
                  "url": "{{$url}}/{i18n.currentLocale}/#/pipeline-ui/setup",
                  "hideSideNav": false
                },
                {
                  "pathSegment": "pipeline-debug",
                  "entityType": "project.component",
                  "url": "{{$url}}/{i18n.currentLocale}/#/pipeline-ui/pipeline-debug",
                  "hideSideNav": false
                },
                {
                  "pathSegment": "feedback",
                  "entityType": "project.component",
                  "url": "{{$url}}/{i18n.currentLocale}/#/pipeline-ui/feedback",
                  "hideSideNav": false
                },
                {
                  "pathSegment": "import-pipeline",
                  "entityType": "project.component",
                  "url": "{{$url}}/{i18n.currentLocale}/#/pipeline-ui/import-pipeline",
                  "hideSideNav": false
                }
              ]
            },
            {
              "pathSegment": "modal",
              "entityType": "project.component",
              "url": "{{$url}}/{i18n.currentLocale}/#/modal",
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