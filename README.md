# self-growth-app 🌱

毎日のタスク管理と習慣化を支援する自己成長アプリです。
**「サボり」を可視化してモチベーションを維持する** ことを目的にしています。

## 主な機能

### ✅ タスク管理
- **固定タスク**（毎日やること）と **その日だけのタスク** を登録できます
- タスクの **70%以上** を完了すると「今日の達成」になります
- 毎日 0時（日本時間）にタスクがリセットされます

### 🔔 プッシュ通知
- その日のタスクが未達成のとき、設定した時刻にプッシュ通知が届きます
- 平日・休日（土日）で別々に通知時刻を設定できます（各最大5件）
- 「まだ達成していない。今日もサボるの？」など、心理的プレッシャーをかける文言で通知します
- 達成済みの日は通知されません

### 📅 カレンダー記録
- 達成した日は 🟩、未達成の日は 🟥 で表示されます
- ストリーク（連続達成日数）を表示します
- ストリークが途切れると演出が表示されます

### 📱 UI
- スマホ優先のデザイン
- ダークモード対応
- PWA 対応（ホーム画面に追加できます）

## 技術スタック

| 分類 | 使用技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) / React 19 |
| 言語 | TypeScript |
| スタイル | Tailwind CSS v4 |
| カレンダー | FullCalendar |
| アイコン | lucide-react |
| データ保存 | localStorage（タスク・記録）/ Upstash Redis（通知用データ） |
| 通知 | Web Push (`web-push`) / Upstash QStash / Vercel Cron |
| テスト | Vitest / React Testing Library |
| デプロイ | Vercel（GitHub Actions 経由） |

## 通知の仕組み

```
① 毎日 0時(JST) に Vercel Cron が /api/cron/schedule を呼ぶ
        ↓
② Redis から通知設定を読み、今日（平日 or 休日）の通知時刻を QStash に予約する
        ↓
③ 予約した時刻になると QStash が /api/send-notification を呼ぶ
        ↓
④ Redis で今日の達成状況を確認し、未達成ならプッシュ通知を送る
```

### API ルート一覧

| パス | 役割 |
| --- | --- |
| `/api/subscribe` | プッシュ通知の購読情報を保存（POST）・削除（DELETE） |
| `/api/notification-settings` | 通知設定の取得（GET）・保存（POST） |
| `/api/achievement` | 今日の達成状況の保存・取得 |
| `/api/cron/schedule` | その日の通知を QStash に予約する（Vercel Cron から実行） |
| `/api/send-notification` | プッシュ通知を送信する（QStash から実行） |

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクト直下に `.env.local` を作成し、以下の環境変数を設定してください。
（値は各サービスの管理画面で確認してください。**`.env` 系のファイルは絶対に Git にコミットしないでください**）

| 変数名 | 説明 |
| --- | --- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push 用の VAPID 公開鍵 |
| `VAPID_PRIVATE_KEY` | Web Push 用の VAPID 秘密鍵 |
| `VAPID_CONTACT_EMAIL` | VAPID に登録する連絡先メールアドレス |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis の REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis の REST トークン |
| `QSTASH_URL` | Upstash QStash の URL |
| `QSTASH_TOKEN` | Upstash QStash のトークン |
| `BASE_URL` | アプリの公開 URL（QStash が通知 API を呼ぶ先。末尾の `/` は不要） |

> 💡 VAPID キーは `npx web-push generate-vapid-keys` で作成できます。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリが表示されます。

## コマンド一覧

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用にビルド |
| `npm run start` | ビルドしたアプリを起動 |
| `npm test` | テストを1回実行 |
| `npm run test:watch` | ファイル変更を監視してテストを自動実行 |

## フォルダ構成

```
src/
├── app/
│   ├── layout.tsx          # 全ページ共通のレイアウト
│   ├── page.tsx            # メインページ（タブナビゲーション）
│   ├── manifest.ts         # PWA 設定
│   └── api/                # サーバー側の API ルート（通知まわり）
├── components/
│   ├── ui/                 # ボタン・入力欄など小さい汎用部品
│   └── features/           # 今日のタスク・固定タスク・カレンダー・通知設定など機能単位の部品
├── hooks/
│   ├── useTasks.ts         # タスク管理フック
│   └── useNotifications.ts # 通知管理フック
├── lib/
│   ├── types.ts            # TypeScript の型定義
│   ├── storage.ts          # localStorage の読み書き・計算関数
│   └── notifications.ts    # 通知ユーティリティ
└── test/
    └── setup.ts            # テストの共通設定
```

## CI/CD

GitHub Actions（`.github/workflows/ci-cd.yml`）で自動化しています。

- **プルリクエスト時（main 向け）**: テストを実行
- **main ブランチへの push 時**: テストが通ったら Vercel の本番環境へ自動デプロイ

GitHub の Secrets に以下を登録する必要があります。

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
