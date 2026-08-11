output "state_bucket_name" {
  description = "S3 bucket name to use in the backend configuration of other Terraform roots."
  value       = aws_s3_bucket.terraform_state.id
}

output "state_bucket_arn" {
  description = "ARN of the Terraform state bucket."
  value       = aws_s3_bucket.terraform_state.arn
}

output "backend_example" {
  description = "Example S3 backend configuration for the dev environment."
  value       = <<-EOT
    terraform {
      backend "s3" {
        bucket       = "${aws_s3_bucket.terraform_state.id}"
        key          = "mini-erp/dev/terraform.tfstate"
        region       = "${var.aws_region}"
        encrypt      = true
        use_lockfile = true
      }
    }
  EOT
}

output "github_actions_role_arn" {
  description = "IAM role assumed by GitHub Actions through OIDC."
  value       = aws_iam_role.github_actions.arn
}

output "terraform_actions_role_arn" {
  description = "IAM role assumed by approved GitHub Actions Terraform jobs."
  value       = aws_iam_role.terraform_actions.arn
}
