variable "aws_region" {
  description = "AWS region used for regional frontend resources."
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name used in resource names and tags."
  type        = string
  default     = "mini-erp"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "github_actions_role_name" {
  description = "Existing IAM role assumed by GitHub Actions."
  type        = string
  default     = "mini-erp-github-actions"
}
