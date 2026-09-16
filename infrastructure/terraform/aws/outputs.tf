output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "PostgreSQL primary connection endpoint"
}

output "redis_endpoint" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  description = "Redis cache endpoint"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.storage.bucket
  description = "S3 assets and backup bucket"
}
