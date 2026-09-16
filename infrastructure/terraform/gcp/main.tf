terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# ---------------------------------------------------------------------
# 1. VPC & SERVERLESS VPC ACCESS CONNECTOR
# ---------------------------------------------------------------------
resource "google_compute_network" "vpc" {
  name                    = "restovyn-vpc-${var.environment}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "restovyn-subnet-${var.environment}"
  ip_cidr_range = "10.10.0.0/20"
  region        = var.gcp_region
  network       = google_compute_network.vpc.id
}

resource "google_vpc_access_connector" "connector" {
  name          = "restovyn-con-${var.environment}"
  region        = var.gcp_region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc.name
}

# ---------------------------------------------------------------------
# 2. CLOUD SQL POSTGRESQL 16 (HIGH AVAILABILITY)
# ---------------------------------------------------------------------
resource "google_sql_database_instance" "postgres" {
  name             = "restovyn-db-${var.environment}"
  database_version = "POSTGRES_16"
  region           = var.gcp_region

  settings {
    tier              = "db-custom-2-7680" # 2 vCPU, 7.5GB RAM
    availability_type = "REGIONAL"         # Multi-zone High Availability
    disk_size         = 50
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "02:00" # Automated daily backup at 2 AM
    }

    database_flags {
      name  = "shared_buffers"
      value = "524288" # in 8kB units (~512MB)
    }

    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.vpc.id
    }
  }
}

resource "google_sql_database" "database" {
  name     = "restovyn_db"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "users" {
  name     = "restovyn"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# ---------------------------------------------------------------------
# 3. MEMORYSTORE FOR REDIS
# ---------------------------------------------------------------------
resource "google_redis_instance" "redis" {
  name               = "restovyn-cache-${var.environment}"
  tier               = "STANDARD_HA" # Multi-zone failover
  memory_size_gb     = 2
  region             = var.gcp_region
  authorized_network = google_compute_network.vpc.id
  redis_version      = "REDIS_7_0"
}

# ---------------------------------------------------------------------
# 4. CLOUD STORAGE BUCKET (Invoices, Receipts & Backups)
# ---------------------------------------------------------------------
resource "google_storage_bucket" "assets" {
  name                        = "restovyn-assets-${var.gcp_project_id}-${var.environment}"
  location                    = var.gcp_region
  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }
}
