# ArgoCD setup for nonprod-us-west

Documentation on [Confluence](https://actionablescience.atlassian.net/wiki/spaces/DO/pages/334071157/Argo+CD+Setup)

## Pre-requisites

We need a service principal in azure with that can access the Azure Container registry.

## Required Changes:

- **argocd-bitbucket-secret.yaml**: Specify the Bitbucket Helm chart repository URL (e.g., `git-ops`), along with the personal access token and username.
- **argocd-image-updater-configmap.yaml**: Specify the URL of the Azure Container Registry, e.g., `actionablescience.azurecr.io`.
- **argocd-image-updater-ecr-configmap.yaml**: Provide the Service Principal ID, Secret ID, and Azure Container Registry URL.

## Setup argocd:

```bash
kubectl kustomize build . | kubectl apply -f -
```

## Access the ArgoCD UI

To access the ArgoCD UI, follow these steps:

1. Visit the URL: [https://argocd.apps.actionable-science.com](https://argocd.apps.actionable-science.com) It will be different in different env. Check the ingress file. It will be different in deifferent env.
2. Use the default credentials:
    - **Username:** `admin`
    - **Password:** Retrieve the password using the following command:
      ```sh
      kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
      ```

## Structure

```
tree .

.
├── apps
│   ├── README.md
│   ├── argocd-demo-env
│   │   ├── README.md
│   │   ├── adminapi-service
│   │   │   ├── adminapi-service-secrets.yaml
│   │   │   ├── argocd-adminapi-service.yaml
│   │   │   ├── configmap.file
│   │   │   ├── deployment-patch.yaml
│   │   │   ├── kustomization.yaml
│   │   │   ├── readme.md
│   │   │   ├── setup.sh
│   │   │   └── values.yaml
│   │   ├── azure-vault-authenticate.yaml
│   │   └── ticketing-service-v2
│   │       ├── README.md
│   │       ├── argocd-ticketing-service-v2.yaml
│   │       ├── configmap.file
│   │       ├── deployment-patch.yaml
│   │       ├── kustomization.yaml
│   │       ├── setup.sh
│   │       ├── ticketing-service-v2-secrets.yaml
│   │       └── values.yaml
│   ├── beta
│   │   └── README.md
│   ├── dev
│   │   └── README.md
│   └── test
│       └── README.md
├── helm-charts
│   └── actionable-science-app
│       ├── Chart.yaml
│       ├── templates
│       │   ├── NOTES.txt
│       │   ├── _helpers.tpl
│       │   ├── configmap.yaml
│       │   ├── deployment.yaml
│       │   ├── hpa.yaml
│       │   ├── ingress.yaml
│       │   ├── pdb.yaml
│       │   ├── service.yaml
│       │   └── tests
│       │       └── test-connection.yaml
│       └── values-template.yaml
└── platform
    ├── argocd
    │   └── nonprod-us-west
    │       ├── README.md
    │       ├── argocd-bitbucket-secret.yaml
    │       ├── argocd-cm.yaml
    │       ├── argocd-image-updater-configmap.yaml
    │       ├── argocd-image-updater-ecr-configmap.yaml
    │       ├── ingress.yaml
    │       ├── kustomization.yaml
    │       ├── namespace.yaml
    │       ├── patch-argocd-image-updater-deployment.yaml
    │       └── service-monitor.yaml
    ├── cert-manager
    │   ├── argocd-cert-manager.yaml
    │   ├── kustomization.yaml
    │   └── namespace.yaml
    ├── external-secrets-operator
    │   ├── README.md
    │   ├── argocd-eso.yaml
    │   ├── kustomization.yaml
    │   └── namespace.yaml
    └── nginx-ingress-controller
        ├── argocd-nginx-ingress-controller.yaml
        ├── kustomization.yaml
        └── namespace.yaml
```
