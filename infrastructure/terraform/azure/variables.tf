variable "azure_location" {
  type        = string
  description = "Azure deployment region"
  default     = "centralindia"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "production"
}

variable "restaurant_identifier" {
  type        = string
  description = "Unique single restaurant identifier"
  default     = "restovyn"
}

variable "db_password" {
  type        = string
  description = "Master password for Azure Database for PostgreSQL"
  sensitive   = true
}
