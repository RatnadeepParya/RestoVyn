terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-${var.restaurant_identifier}-${var.environment}"
  location = var.azure_location
}

# ---------------------------------------------------------------------
# 1. VIRTUAL NETWORK & SUBNETS
# ---------------------------------------------------------------------
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-${var.restaurant_identifier}-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "db_subnet" {
  name                 = "snet-db"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
  service_endpoints    = ["Microsoft.Storage"]
  delegation {
    name = "fs-delegation"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# ---------------------------------------------------------------------
# 2. AZURE DATABASE FOR POSTGRESQL FLEXIBLE SERVER (HA)
# ---------------------------------------------------------------------
resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "psql-${var.restaurant_identifier}-${var.environment}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "16"
  delegated_subnet_id    = azurerm_subnet.db_subnet.id
  administrator_login    = "restovyn"
  administrator_password = var.db_password
  storage_mb             = 65536
  sku_name               = "GP_Standard_D2s_v3"
  backup_retention_days  = 30

  high_availability {
    mode = "ZoneRedundant"
  }
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "restovyn_db"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# ---------------------------------------------------------------------
# 3. AZURE CACHE FOR REDIS
# ---------------------------------------------------------------------
resource "azurerm_redis_cache" "redis" {
  name                = "redis-${var.restaurant_identifier}-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  capacity            = 1
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
}

# ---------------------------------------------------------------------
# 4. AZURE STORAGE ACCOUNT (Receipts, Invoices, Backups)
# ---------------------------------------------------------------------
resource "azurerm_storage_account" "storage" {
  name                     = "st${var.restaurant_identifier}${var.environment}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  min_tls_version          = "TLS1_2"
}

resource "azurerm_storage_container" "invoices" {
  name                  = "invoices"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "private"
}
