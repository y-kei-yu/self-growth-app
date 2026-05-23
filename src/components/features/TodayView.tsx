// 「今日」タブのコンポーネント
// 役割: 今日のタスク一覧・達成率・タスク追加フォームを表示する
// ダークモード対応・通知許可バナー付き

"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { DailyTask } from "@/lib/types";

type Props = {
  todayLabel: string; // "2026年5月23日（金）" のような日付文字列
  todayTasks: DailyTask[]; // 今日のタスク一覧
  completionRate: number; // 達成率（0〜1の小数）
  achieved: boolean; // 70%以上達成したか
  toggleTask: (id: string) => void; // チェックボックスを切り替える
  removeTodayTask: (id: string) => void; // 今日だけのタスクを削除する
  newTask: string;
  setNewTask: (v: string) => void;
  addTodayTask: (title: string) => void;
  // 通知関連
  notificationPermission: NotificationPermission;
  onAskNotificationPermission: () => void;
};

export function TodayView({
  todayLabel,
  todayTasks,
  completionRate,
  achieved,
  toggleTask,
  removeTodayTask,
  newTask,
  setNewTask,
  addTodayTask,
  notificationPermission,
  onAskNotificationPermission,
}: Props) {
  // 達成率を0〜100の整数に変換
  const pct = Math.round(completionRate * 100);

  return (
    <div className="space-y-4">
      {/* 日付 */}
      <p className="text-sm text-gray-400 dark:text-gray-500">{todayLabel}</p>

      {/* 通知許可バナー: まだ許可/拒否を選んでいない場合に表示 */}
      {notificationPermission === "default" && (
        <button
          onClick={onAskNotificationPermission}
          className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300 text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          🔔 通知を有効にして、サボりを防ぐ →
        </button>
      )}

      {/* 通知が拒否されている場合の案内 */}
      {notificationPermission === "denied" && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center px-2">
          通知がブロックされています。ブラウザの設定から許可してください。
        </p>
      )}

      {/* 達成率カード */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-200">達成率</span>
          <span
            className={`text-2xl font-bold ${
              achieved ? "text-green-500" : "text-gray-700 dark:text-gray-100"
            }`}
          >
            {pct}%
          </span>
        </div>
        {/* プログレスバー */}
        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              achieved ? "bg-green-500" : "bg-blue-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {achieved && (
          <p className="mt-2 text-center text-green-600 dark:text-green-400 text-sm font-medium">
            今日の目標達成！🎉
          </p>
        )}
        {!achieved && todayTasks.length > 0 && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-right">
            70% 以上で達成
          </p>
        )}
      </div>

      {/* タスク一覧 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {todayTasks.length === 0 ? (
          <p className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
            タスクを追加してください
          </p>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-700">
            {todayTasks.map((t) => (
              <li key={t.id} className="flex items-center px-4 py-3 gap-3">
                {/* チェックボックス（丸いボタン） */}
                <button
                  onClick={() => toggleTask(t.id)}
                  aria-label={t.completed ? "未完了に戻す" : "完了にする"}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                    t.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 dark:border-gray-600 hover:border-green-400"
                  }`}
                />
                {/* タスク名 */}
                <span
                  className={`flex-1 text-sm ${
                    t.completed
                      ? "line-through text-gray-300 dark:text-gray-600"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {t.title}
                </span>
                {/* 固定タスクは削除できない、今日だけのタスクは×ボタンで削除 */}
                {t.isFixed ? (
                  <span className="text-xs text-gray-300 dark:text-gray-600 select-none">
                    固定
                  </span>
                ) : (
                  <button
                    onClick={() => removeTodayTask(t.id)}
                    aria-label="削除"
                    className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-lg leading-none"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* タスク追加フォーム */}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const t = newTask.trim();
          if (t) {
            addTodayTask(t);
            setNewTask("");
          }
        }}
      >
        <Input
          value={newTask}
          onChange={setNewTask}
          placeholder="今日のタスクを追加..."
          focusColor="green"
        />
        <Button type="submit" variant="primary">
          追加
        </Button>
      </form>
    </div>
  );
}
