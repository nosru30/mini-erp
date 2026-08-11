variable "aws_region" {
  description = "AWS region in which to create the Terraform state bucket."
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name used in the state bucket name and tags."
  type        = string
  default     = "mini-erp"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.project_name))
    error_message = "project_name must use lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen."
  }
}

variable "state_bucket_name" {
  description = "Optional explicit globally unique bucket name. By default the AWS account ID and region are included."
  type        = string
  default     = null

  validation {
    condition = var.state_bucket_name == null || can(regex(
      "^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$",
      var.state_bucket_name,
    ))
    error_message = "state_bucket_name must be a valid lowercase S3 bucket name."
  }
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the Actions IAM role, in owner/name format."
  type        = string
  default     = "nosru30/mini-erp"

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repository))
    error_message = "github_repository must use the owner/name format."
  }
}

variable "github_repository_owner_id" {
  description = "Immutable GitHub owner ID included in the customized OIDC subject."
  type        = string
  default     = "106005051"

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repository_owner_id))
    error_message = "github_repository_owner_id must contain only digits."
  }
}

variable "github_repository_id" {
  description = "Immutable GitHub repository ID included in the customized OIDC subject."
  type        = string
  default     = "1310859681"

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repository_id))
    error_message = "github_repository_id must contain only digits."
  }
}

variable "github_branch" {
  description = "GitHub branch allowed to assume the Actions IAM role."
  type        = string
  default     = "main"
}

variable "github_terraform_environment" {
  description = "GitHub Environment whose approved jobs may assume the Terraform IAM role."
  type        = string
  default     = "dev-infrastructure"

  validation {
    condition     = length(trimspace(var.github_terraform_environment)) > 0
    error_message = "github_terraform_environment must not be empty."
  }
}
