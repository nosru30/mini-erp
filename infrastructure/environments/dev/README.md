# Dev environment

React frontendを非公開S3バケットへ配置し、CloudFront Origin Access Control経由で配信します。
S3へのパブリックアクセスは許可しません。
バックエンドのコンテナイメージを保存するECR Repositoryも作成します。

## 初回作成

bootstrapで作成したstateバケットとGitHub Actions用IAMロールが必要です。

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -out=dev.tfplan
terraform apply dev.tfplan
```

CloudFrontの作成には数分かかることがあります。作成後、GitHub Actionsに登録する値とURLを確認します。

```bash
terraform output -raw frontend_bucket_name
terraform output -raw cloudfront_distribution_id
terraform output -raw frontend_url
terraform output -raw backend_ecr_repository_name
terraform output -raw backend_ecr_repository_url
```

## GitHub Actions variables

Repository Variablesへ次を登録します。

- `AWS_ROLE_ARN`: bootstrapで作成したIAMロールARN
- `FRONTEND_BUCKET_NAME`: `frontend_bucket_name` output
- `CLOUDFRONT_DISTRIBUTION_ID`: `cloudfront_distribution_id` output

`main`ブランチの`frontend/**`に変更がpushされると、フロントエンドをビルドしてS3へ同期し、CloudFrontキャッシュを無効化します。

通常CIのバックエンドテストが成功すると、`main`ブランチへのpush時だけDockerイメージをECRへpushします。イメージタグは`sha-<Git commit SHA>`です。

バックエンドはまだCloudFront originに設定していないため、画面は表示できますが`/api/*`への通信はバックエンド構築まで成功しません。
