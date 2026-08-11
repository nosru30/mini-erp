output "frontend_bucket_name" {
  description = "Private S3 bucket containing the frontend build."
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID used for cache invalidation."
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_url" {
  description = "HTTPS URL of the CloudFront frontend."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "backend_ecr_repository_name" {
  description = "ECR repository name for backend container images."
  value       = aws_ecr_repository.backend.name
}

output "backend_ecr_repository_url" {
  description = "ECR repository URL used when tagging backend container images."
  value       = aws_ecr_repository.backend.repository_url
}

output "backend_load_balancer_dns_name" {
  description = "ALB DNS name used as the CloudFront API origin."
  value       = aws_lb.backend.dns_name
}

output "backend_ecs_cluster_name" {
  description = "ECS cluster running the backend service."
  value       = aws_ecs_cluster.backend.name
}

output "backend_ecs_service_name" {
  description = "ECS service running the backend tasks."
  value       = aws_ecs_service.backend.name
}

output "database_endpoint" {
  description = "Private PostgreSQL endpoint used by the backend."
  value       = aws_db_instance.backend.endpoint
}
