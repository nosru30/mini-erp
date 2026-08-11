locals {
  frontend_parameter_path = "/${var.project_name}/${var.environment}/frontend"
}

resource "aws_ssm_parameter" "frontend_bucket_name" {
  name  = "${local.frontend_parameter_path}/bucket-name"
  type  = "String"
  value = aws_s3_bucket.frontend.id
}

resource "aws_ssm_parameter" "cloudfront_distribution_id" {
  name  = "${local.frontend_parameter_path}/cloudfront-distribution-id"
  type  = "String"
  value = aws_cloudfront_distribution.frontend.id
}

resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name  = "${local.frontend_parameter_path}/cognito-user-pool-id"
  type  = "String"
  value = aws_cognito_user_pool.users.id
}

resource "aws_ssm_parameter" "cognito_user_pool_client_id" {
  name  = "${local.frontend_parameter_path}/cognito-user-pool-client-id"
  type  = "String"
  value = aws_cognito_user_pool_client.frontend.id
}

data "aws_iam_policy_document" "github_actions_frontend_parameters" {
  statement {
    sid     = "ReadFrontendDeploymentParameters"
    actions = ["ssm:GetParameter"]
    resources = [
      aws_ssm_parameter.frontend_bucket_name.arn,
      aws_ssm_parameter.cloudfront_distribution_id.arn,
      aws_ssm_parameter.cognito_user_pool_id.arn,
      aws_ssm_parameter.cognito_user_pool_client_id.arn,
    ]
  }
}

resource "aws_iam_role_policy" "github_actions_frontend_parameters" {
  name   = "${var.project_name}-${var.environment}-frontend-parameters"
  role   = data.aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_actions_frontend_parameters.json
}
