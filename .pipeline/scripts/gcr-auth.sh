#!/bin/sh

set -e

echo "1. Transforming GCP credentials to file"
echo -n $GCP_JSON_KEY_BASE64 | base64 -d > service-account.json

echo "2. Retrieving JWT id_token from GCP using given file"
gcloud auth activate-service-account --key-file=./service-account.json
export GCP_REGISTRY_REFERENCE_TOKEN=$(gcloud auth print-access-token gcr-pull@sap-gcp-dxp-prod.iam.gserviceaccount.com)

echo "3. Substituting the entry in yarnrc by actual token"
sed -i -e "s#\"\${GCP_REGISTRY_REFERENCE_TOKEN-}\"#$GCP_REGISTRY_REFERENCE_TOKEN#g" .yarnrc.yml
