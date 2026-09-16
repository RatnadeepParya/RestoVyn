variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Project ID"
}

variable "gcp_region" {
  type        = string
  description = "GCP deployment region"
  default     = "asia-south1" # Mumbai
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "production"
}

variable "db_password" {
  type        = string
  description = "Master password for Cloud SQL PostgreSQL"
  sensitive   = true
}
