#!/bin/sh

set -e

echo "Transforming GCP credentials to file"
echo -n $GCP_JSON_KEY_BASE64 | base64 -d > service-account.json

cat service-account.json

echo "Retrieving JWT id_token from GCP using given file"
gcloud auth activate-service-account --key-file=./service-account.json
export GCP_REGISTRY_REFERENCE_TOKEN=$(gcloud auth print-access-token gcr-pull@sap-gcp-dxp-prod.iam.gserviceaccount.com)

echo "$GCP_REGISTRY_REFERENCE_TOKEN"

echo "Substituting the entry in yarnrc by actual token"
sed -i -e "s#\"\${GCP_REGISTRY_REFERENCE_TOKEN-}\"#$GCP_REGISTRY_REFERENCE_TOKEN#g" .yarnrc.yml
