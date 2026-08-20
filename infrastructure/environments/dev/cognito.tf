resource "aws_cognito_user_pool" "users" {
  name = "${var.project_name}-${var.environment}-users"

  username_configuration {
    case_sensitive = false
  }

  alias_attributes         = ["email"]
  auto_verified_attributes = ["email"]
  mfa_configuration        = "OFF"
  deletion_protection      = "INACTIVE"

  admin_create_user_config {
    allow_admin_create_user_only = true

    invite_message_template {
      email_message = "Mini ERPのユーザー名は{username}、一時パスワードは{####}です。"
      email_subject = "Mini ERP アカウントのご案内"
      sms_message   = "Mini ERP: ユーザー名 {username} / 一時パスワード {####}"
    }
  }

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "frontend" {
  name         = "${var.project_name}-${var.environment}-frontend"
  user_pool_id = aws_cognito_user_pool.users.id

  generate_secret               = false
  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
  auth_session_validity         = 3

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_group" "admins" {
  name         = "ADMIN"
  user_pool_id = aws_cognito_user_pool.users.id
  description  = "Mini ERP system administrators"
}
