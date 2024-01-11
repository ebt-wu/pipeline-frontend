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
              "url": "{{$url}}/main.js#cicd-project-promotion-card",
              "dxpOrder": 2,
              {{- if eq .Values.environment "live" }}
              "visibleForContext": "!featureFlags || !featureFlags.enabledProjects || contains(featureFlags.enabledProjects, entityContext.project.id)",
              {{- end }}
              {{- with .Values.features }}
              "context": {
                "featureFlags": {{ . | toJson }}
              },
              {{- end}}
              "layoutConfig": {
                "slot": "content"
              },
              "webcomponent": {
                "selfRegistered": true
              }
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