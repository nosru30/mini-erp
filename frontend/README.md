# Mini ERP

卸売業向けの受注・在庫・出荷管理を題材にしたポートフォリオです。

## 技術構成

- Spring Boot
- React
- TypeScript
- PostgreSQL
- Docker Compose
- Flyway

## フロントエンドの起動

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Cognito認証には、ビルド時に次の環境変数が必要です。

```text
VITE_COGNITO_USER_POOL_ID
VITE_COGNITO_USER_POOL_CLIENT_ID
```

値が未設定の場合、アプリケーションはCognito設定不足画面を表示します。
