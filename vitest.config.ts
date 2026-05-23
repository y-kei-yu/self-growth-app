// Vitestの設定ファイル
// テストをどんな環境で動かすか、どのファイルをテストするかを定義する

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()], // ReactのJSXをVitestが理解できるようにする

  test: {
    environment: "jsdom", // ブラウザ環境をNode.jsで再現（localStorageなどが使えるようになる）
    globals: true, // describe, it, expect などをimportせず使えるようにする
    setupFiles: ["./src/test/setup.ts"], // テスト前に実行するセットアップファイル
  },

  resolve: {
    alias: {
      // "@/xxx" というimportパスを "src/xxx" として解決する（Next.jsと同じ設定）
      "@": resolve(__dirname, "./src"),
    },
  },
});
