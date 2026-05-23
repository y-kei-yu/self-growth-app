// ストリーク（連続達成）が途切れたときに表示するアニメーションオーバーレイ
// 条件: 昨日が未達成 かつ 一昨日が達成 → ストリークが途切れたと判定
// 1日1回だけ表示（localStorageに「今日は見た」を保存して制御）

"use client";

import { useState, useEffect } from "react";
import type { DayRecord } from "@/lib/types";

type Props = {
  dayRecords: Record<string, DayRecord>;
};

export function StreakBreakOverlay({ dayRecords }: Props) {
  const [visible, setVisible] = useState(false); // オーバーレイを表示するか
  const [fading, setFading] = useState(false); // フェードアウト中か

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 昨日と一昨日の日付文字列を作る（例: "2026-05-22"）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split("T")[0];

    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    const dbKey = dayBefore.toISOString().split("T")[0];

    const today = new Date().toISOString().split("T")[0];

    // 今日すでに演出を見たかチェック
    const alreadyShown = localStorage.getItem("streak-broke-shown") === today;
    if (alreadyShown) return;

    // ストリーク途切れの判定: 昨日が未達成 かつ 一昨日が達成
    const streakBroke =
      dayRecords[yKey]?.achieved === false &&
      dayRecords[dbKey]?.achieved === true;

    if (!streakBroke) return;

    // 演出を表示して、今日は見たとマーク
    localStorage.setItem("streak-broke-shown", today);
    setVisible(true);

    // 3秒後にフェードアウト開始
    const fadeTimer = setTimeout(() => setFading(true), 3000);
    // フェードアウト完了後に非表示
    const hideTimer = setTimeout(() => setVisible(false), 3600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [dayRecords]);

  if (!visible) return null;

  return (
    // 画面全体を覆う半透明の黒背景
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      onClick={() => {
        // タップで早期に閉じる
        setFading(true);
        setTimeout(() => setVisible(false), 700);
      }}
    >
      {/* 中央のカード */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 mx-6 text-center shadow-2xl max-w-xs w-full">
        <div className="text-5xl mb-3">💔</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
          ストリーク途切れ…
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          昨日、達成できなかった。
        </p>
        <p className="text-gray-700 dark:text-gray-200 text-sm font-medium">
          今日からまた積み上げよう。
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          タップで閉じる
        </p>
      </div>
    </div>
  );
}
