# Dev environment

React frontendを非公開S3バケットへ配置し、CloudFront Origin Access Control経由で配信します。
S3へのパブリックアクセスは許可しません。
バックエンドのコンテナイメージを保存するECR Repositoryも作成します。
バックエンドはECS Fargateで実行し、ALBをCloudFrontの`/api/*` originとして使用します。PostgreSQLは非公開RDSに配置します。

## 初回作成

bootstrapで作成したstateバケットとGitHub Actions用IAMロールが必要です。

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -out=dev.tfplan
terraform apply dev.tfplan
```

CloudFrontの作成には数分かかることがあります。作成後、出力値とURLを確認します。

```bash
terraform output -raw frontend_bucket_name
terraform output -raw cloudfront_distribution_id
terraform output -raw frontend_url
terraform output -raw backend_ecr_repository_name
terraform output -raw backend_ecr_repository_url
terraform output -raw backend_ecs_cluster_name
terraform output -raw backend_ecs_service_name
terraform output -raw database_endpoint
```

## GitHub Actions variables

Repository Variablesへ次を登録します。

- `AWS_ROLE_ARN`: bootstrapで作成したIAMロールARN

フロントエンドのS3バケット名とCloudFront Distribution IDはTerraformがParameter Storeの
`/mini-erp/dev/frontend/`以下へ保存し、デプロイWorkflowが自動的に取得します。

`main`ブランチの`frontend/**`に変更がpushされると、フロントエンドをビルドしてS3へ同期し、CloudFrontキャッシュを無効化します。

通常CIのバックエンドテストが成功すると、`main`ブランチへのpush時だけDockerイメージをECRへpushします。イメージタグは`sha-<Git commit SHA>`です。

TerraformはECSサービスを`desired_count = 0`で作成します。バックエンドのデプロイWorkflowが
`sha-<Git commit SHA>`タグをECRへpushし、新しいタスク定義を登録してサービスを起動します。

ECS TaskはNAT Gatewayの費用を避けるためpublic subnetでpublic IPを持ちますが、Security GroupはALBからの8080番ポートだけを許可します。RDSはprivate database subnetに配置し、ECSからのPostgreSQL接続だけを許可します。
