variable "aws_region" {
  type        = string
  description = "AWS deployment region"
  default     = "ap-south-1" # Mumbai (closest for Indian restaurants)
}

variable "environment" {
  type        = string
  description = "Deployment environment (production/staging)"
  default     = "production"
}

variable "restaurant_identifier" {
  type        = string
  description = "Unique single restaurant identifier"
  default     = "restovyn-flagship"
}

variable "db_password" {
  type        = string
  description = "Master password for PostgreSQL database"
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "Secret key for JWT token signing"
  sensitive   = true
}
