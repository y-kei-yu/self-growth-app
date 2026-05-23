@AGENTS.md

# self-growth-app

## プロジェクト概要

毎日のタスク管理と習慣化を支援する自己成長アプリ。
サボりを可視化してモチベーションを維持する。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- localStorage（データ保存）
- Web Push通知
- vitest
- React Testing Library

## 機能要件

1. タスク管理
   - 固定タスク＋その日だけのタスクを追加できる
   - 70%以上達成で「今日の達成」とみなす

2. 通知
   - 毎日0時にタスクリセット
   - 未達成なら18時・20時・21時・22時・23時に通知
   - 心理的プレッシャーをかける文言

3. カレンダー記録
   - 達成🟩・未達成🟥で表示
   - ストリーク（連続達成日数）表示
   - ストリークが途切れたら演出あり

4. UI
   - スマホ優先
   - ダークモード対応

## コンポーネント設計

App Routerベースの構成で開発する。

```
src/
├── app/
│   ├── layout.tsx        # 全ページ共通のレイアウト
│   ├── page.tsx          # メインページ（タブナビゲーション）
│   └── manifest.ts       # PWA設定
├── components/
│   ├── ui/               # ボタン・入力欄など小さい汎用部品
│   └── features/         # タスク一覧・カレンダーなど機能単位
├── hooks/
│   ├── useTasks.ts       # タスク管理フック
│   └── useNotifications.ts # 通知管理フック
└── lib/
    ├── types.ts          # TypeScriptの型定義
    ├── storage.ts        # localStorageの読み書き・計算関数
    └── notifications.ts  # 通知ユーティリティ
```

## 開発方針

- コードにはコメントを日本語で書く
- 初心者でも読めるようにシンプルに書く
- 変更前に必ず何をするか説明してから実装する
- 初めてのAI開発なので初心者にもわかるように何をしているか教えてください

## テスト方針

- vitestを使用してユニットテストを書く
- React Testing Libraryでコンポーネントテストを行う
