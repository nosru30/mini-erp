# Terraform bootstrap

mini ERPのTerraform stateを保存する、専用のS3バケットを作成します。
このbootstrapだけはremote backend作成前に実行するため、ローカルstateを使用します。

## バケットの設定

- パブリックアクセスをすべて遮断
- Bucket owner enforced
- SSE-S3（AES-256）による暗号化
- バージョニングによるstate履歴の保持
- TLSを使わないアクセスをBucket Policyで拒否
- Terraformからの誤削除を`prevent_destroy`で防止
- `force_destroy = false`で、stateが入ったバケットの削除を拒否

## 初回作成

AWS認証情報を設定してから実行します。

```bash
cd infrastructure/bootstrap
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -check
terraform validate
terraform plan -out=bootstrap.tfplan
terraform apply bootstrap.tfplan
```

デフォルトのバケット名はAWSアカウントIDとリージョンを含むため、通常は変更不要です。

```text
mini-erp-123456789012-ap-northeast-1-tfstate
```

作成された名前と、後続環境で使用するbackend設定例を確認できます。

```bash
terraform output -raw state_bucket_name
terraform output -raw backend_example
```

## 後続のTerraformでの利用

`infrastructure/environments/dev`などのTerraform rootに、出力された設定を追加します。

```hcl
terraform {
  backend "s3" {
    bucket       = "mini-erp-123456789012-ap-northeast-1-tfstate"
    key          = "mini-erp/dev/terraform.tfstate"
    region       = "ap-northeast-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

`use_lockfile = true`により、同じstateに対するTerraformの同時更新を防ぎます。
DynamoDBによるロックは非推奨になっているため使用しません。

## bootstrap stateの扱い

`infrastructure/bootstrap/terraform.tfstate`はGitへコミットされません。
このstateを失うとバケットが直ちに消えることはありませんが、Terraformでの管理を再開するにはimportが必要になります。初回適用後は、暗号化された安全な場所へバックアップしてください。
