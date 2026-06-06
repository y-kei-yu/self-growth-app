// メインページ
// 役割: タブナビゲーション（今日 / 固定 / カレンダー）と全体レイアウト
// 各タブの中身は src/components/features/ の各コンポーネントが担当する

"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useNotifications } from "@/hooks/useNotifications";
import { calcStreak } from "@/lib/storage";
import { TodayView } from "@/components/features/TodayView";
import { FixedView } from "@/components/features/FixedView";
import { CalendarView } from "@/components/features/CalendarView";
import { StreakBreakOverlay } from "@/components/features/StreakBreakOverlay";

// タブの種類を型として定義
type Tab = "today" | "fixed" | "calendar";

export default function Home() {
  // 現在選択中のタブ
  const [tab, setTab] = useState<Tab>("today");

  // タスク追加フォームの入力値
  const [newTask, setNewTask] = useState("");
  const [newFixed, setNewFixed] = useState("");

  // タスク管理フック（タスクの取得・追加・削除・完了切替）
  const {
    storage,
    todayTasks,
    completionRate,
    achieved,
    toggleTask,
    addTodayTask,
    removeTodayTask,
    addFixedTask,
    removeFixedTask,
  } = useTasks();

  // 通知管理フック（許可状態・通知スケジュール）
  const { permission, askPermission } = useNotifications(achieved);

  // 連続達成日数（ストリーク）を計算
  const streak = storage ? calcStreak(storage.dayRecords) : 0;

  // 今日の日付を日本語形式で表示（例: "2026年5月23日（金）"）
  const todayLabel = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    // 画面全体のコンテナ（ダークモード対応）
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* ストリーク途切れ演出（条件を満たしたときだけ表示） */}
      {storage && (
        <StreakBreakOverlay dayRecords={storage.dayRecords} />
      )}

      <div className="flex-1 max-w-md mx-auto w-full flex flex-col">
        {/* ヘッダー */}
        <header className="px-4 pt-10 pb-2 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Self Growth
          </h1>
          {/* ストリーク数（1日以上連続していれば表示） */}
          {streak > 0 && (
            <span className="text-sm font-semibold text-orange-500 dark:text-orange-400">
              🔥 {streak} 日連続
            </span>
          )}
        </header>

        {/* メインコンテンツ（タブの中身） */}
        <main className="flex-1 px-4 pt-4 pb-28 overflow-y-auto">
          {tab === "today" && (
            <TodayView
              todayLabel={todayLabel}
              todayTasks={todayTasks}
              completionRate={completionRate}
              achieved={achieved}
              toggleTask={toggleTask}
              removeTodayTask={removeTodayTask}
              newTask={newTask}
              setNewTask={setNewTask}
              addTodayTask={addTodayTask}
              notificationPermission={permission}
              onAskNotificationPermission={askPermission}
            />
          )}
          {tab === "fixed" && (
            <FixedView
              fixedTasks={storage?.fixedTasks ?? []}
              removeFixedTask={removeFixedTask}
              newFixed={newFixed}
              setNewFixed={setNewFixed}
              addFixedTask={addFixedTask}
            />
          )}
          {tab === "calendar" && (
            <CalendarView dayRecords={storage?.dayRecords ?? {}} />
          )}
        </main>

        {/* 下部タブナビゲーション（固定表示） */}
        {/* pb-safe: iPhone のホームバー分の余白を自動で追加 */}
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-around shadow-sm"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          {(
            [
              { key: "today", label: "今日", icon: CheckIcon },
              { key: "fixed", label: "固定", icon: StarIcon },
              { key: "calendar", label: "カレンダー", icon: CalendarIcon },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              // py-3・px-8 でタップしやすい大きさに
              className={`flex flex-col items-center gap-1 px-8 pt-3 pb-1 text-xs transition-colors ${
                tab === key
                  ? "text-green-600 dark:text-green-400 font-semibold"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <Icon active={tab === key} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

// ---- アイコンコンポーネント ----
// SVG（ベクター画像）で作ったシンプルなアイコン

function CheckIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#16a34a" : "#9ca3af"}
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24"
      fill={active ? "#16a34a" : "none"}
      stroke={active ? "#16a34a" : "#9ca3af"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#16a34a" : "#9ca3af"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
