data "aws_iam_policy_document" "terraform_actions_assume_role" {
  statement {
    sid     = "AllowGitHubActionsTerraform"
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type = "Federated"
      identifiers = [
        aws_iam_openid_connect_provider.github_actions.arn,
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${local.github_oidc_repository}:ref:refs/heads/${var.github_branch}",
        "repo:${local.github_oidc_repository}:environment:${var.github_terraform_environment}",
      ]
    }
  }
}

resource "aws_iam_role" "terraform_actions" {
  name               = "${var.project_name}-terraform"
  description        = "Role assumed by GitHub Actions to manage ${var.project_name} infrastructure."
  assume_role_policy = data.aws_iam_policy_document.terraform_actions_assume_role.json
}

resource "aws_iam_role_policy_attachment" "terraform_actions_power_user" {
  role       = aws_iam_role.terraform_actions.name
  policy_arn = "arn:aws:iam::aws:policy/PowerUserAccess"
}

data "aws_iam_policy_document" "terraform_actions_iam" {
  statement {
    sid = "ManageProjectRoles"
    actions = [
      "iam:AttachRolePolicy",
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:DeleteRolePolicy",
      "iam:DetachRolePolicy",
      "iam:GetRole",
      "iam:GetRolePolicy",
      "iam:ListAttachedRolePolicies",
      "iam:ListInstanceProfilesForRole",
      "iam:ListRolePolicies",
      "iam:PassRole",
      "iam:PutRolePolicy",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:UpdateAssumeRolePolicy",
      "iam:UpdateRoleDescription",
    ]
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-*",
    ]
  }
}

resource "aws_iam_role_policy" "terraform_actions_iam" {
  name   = "${var.project_name}-terraform-iam"
  role   = aws_iam_role.terraform_actions.id
  policy = data.aws_iam_policy_document.terraform_actions_iam.json
}
