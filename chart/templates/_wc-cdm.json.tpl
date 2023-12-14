{{- define "wc.cdm" }}
{{ $url := printf "%s://%s" .Values.protocol .Values.site.wcDomain -}}
{
  "_version": "3.0",
  "payload": {
    "visualizations": {
      "LuigiNavConfig": {
        "vizType": "sap.luigi.node",
        "vizConfig": {
          "nodes": [
            {
              "entityType": "project.overview::compound",
              "url": "{{$url}}/{i18n.currentLocale}/main.js#cicd-project-promotion-card",
              "dxpOrder": 2,
              "layoutConfig": {
                "slot": "content"
              },
              "webcomponent": {
                "selfRegistered": true
              }
              {{- if eq .Values.environment "live" }}
              "visibleForContext": "contains({{ .Values.features.enabledProjects | toJson | replace "\"" "'" }}, entityContext.project.id)",
              {{- end }}
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
      "textDictionary": {}
    }
  ]
}
{{- end }}