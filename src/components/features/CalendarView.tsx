// カレンダータブのコンポーネント
// FullCalendarライブラリで達成日（緑）・未達成日（赤）を表示する
// FullCalendarはブラウザ専用のため、dynamic + ssr:false で読み込む

"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { DayRecord } from "@/lib/types";

// FullCalendarInner（実際にFCを使うコンポーネント）をSSRなしで読み込む
// ssr: false = ブラウザでのみ実行する（サーバーでは実行しない）
const FullCalendarInner = dynamic(
  () => import("./FullCalendarInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        カレンダーを読み込み中...
      </div>
    ),
  }
);

type Props = {
  dayRecords: Record<string, DayRecord>;
};

export function CalendarView({ dayRecords }: Props) {
  // dayRecordsをFullCalendarのイベント形式に変換する
  // useMemoで、dayRecordsが変わらない限り再計算しない（パフォーマンス最適化）
  const events = useMemo(
    () =>
      Object.entries(dayRecords).map(([date, record]) => ({
        start: date,
        display: "background", // 背景色としてハイライト（通常のイベント枠は出ない）
        backgroundColor: record.achieved ? "#22c55e" : "#fca5a5",
        // 達成 → 緑 (#22c55e)、未達成 → 薄赤 (#fca5a5)
      })),
    [dayRecords]
  );

  return (
    // 画面の高さからヘッダー・タブバー・パディング分を引いた高さに固定
    // calc(100dvh - 200px): スクロールなしでカレンダーが収まるよう計算
    <div className="flex flex-col gap-3" style={{ height: "calc(100dvh - 200px)" }}>
      {/* カレンダー本体（残りの高さを全部使う） */}
      <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-3 overflow-hidden">
        <FullCalendarInner events={events} />
      </div>

      {/* 凡例（色の意味の説明） */}
      <div className="flex gap-6 justify-center text-xs text-gray-400 dark:text-gray-500 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-green-400 rounded-sm inline-block" />
          達成
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-300 rounded-sm inline-block" />
          未達成
        </span>
      </div>
    </div>
  );
}
