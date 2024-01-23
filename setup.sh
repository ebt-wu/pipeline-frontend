gcloud auth login

echo 'You need to run:\n\n\texport GCP_REGISTRY_REFERENCE_TOKEN=$(gcloud auth print-access-token)\n\nin your current shell session'

## replace GCP_REGISTRY_REFERENCE_TOKEN in .env.yarn
sed -i "s/GCP_REGISTRY_REFERENCE_TOKEN=/GCP_REGISTRY_REFERENCE_TOKEN=$(gcloud auth print-access-token)/g" .env.yarn