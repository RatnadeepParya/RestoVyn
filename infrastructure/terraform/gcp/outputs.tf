output "cloud_sql_connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "Cloud SQL instance connection string"
}

output "redis_host" {
  value       = google_redis_instance.redis.host
  description = "Memorystore Redis IP address"
}

output "storage_bucket" {
  value       = google_storage_bucket.assets.name
  description = "Cloud Storage bucket name"
}
