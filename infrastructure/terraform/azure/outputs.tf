output "postgres_fqdn" {
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
  description = "Azure PostgreSQL Flexible Server FQDN"
}

output "redis_hostname" {
  value       = azurerm_redis_cache.redis.hostname
  description = "Azure Cache for Redis Hostname"
}

output "storage_account_name" {
  value       = azurerm_storage_account.storage.name
  description = "Azure Storage Account Name"
}
