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
