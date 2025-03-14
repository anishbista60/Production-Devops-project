provider "azurerm" {
  features {}
  skip_provider_registration = true
}

resource "azurerm_resource_group" "cluster_group" {
  name     = "cluster-group" 
  location = "East US"
}

data "azurerm_resource_group" "production_project" {
  name = "production-project" 
}

resource "azurerm_kubernetes_cluster" "default" {
  name                = "todo-cluster"
  location            = azurerm_resource_group.cluster_group.location  
  resource_group_name = azurerm_resource_group.cluster_group.name     
  dns_prefix          = "aks-dns"
  kubernetes_version  = "1.30.9"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_D2_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}

data "azurerm_container_registry" "acr" {
  name                = "todoAppProject"
  resource_group_name = data.azurerm_resource_group.production_project.name  
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.default.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = data.azurerm_container_registry.acr.id
  skip_service_principal_aad_check = true
}

output "aks_principal_id" {
  description = "The principal ID of the AKS cluster's system-assigned identity."
  value       = azurerm_kubernetes_cluster.default.identity.0.principal_id
}

output "aks_connect_command" {
  description = "Command to connect to the AKS cluster."
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.cluster_group.name} --name ${azurerm_kubernetes_cluster.default.name}"
}
