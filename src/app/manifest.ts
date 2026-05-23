// PWAマニフェスト
// スマホのホーム画面にアプリを追加するための設定ファイル
// Next.jsが自動的に /manifest.webmanifest として配信してくれる

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Self Growth - 自己成長アプリ",
    short_name: "Self Growth",
    description: "毎日のタスク管理と習慣化を支援する自己成長アプリ",
    start_url: "/",
    display: "standalone", // ブラウザのUIを非表示にしてアプリっぽく見せる
    background_color: "#111827", // ダークモード背景色
    theme_color: "#16a34a", // ブラウザのURLバーの色（緑）
    icons: [],
  };
}
