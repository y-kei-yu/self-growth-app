// 「固定タスク」タブのコンポーネント
// 役割: 毎日自動で追加される繰り返しタスクの管理
// ダークモード対応

"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { FixedTask } from "@/lib/types";

type Props = {
  fixedTasks: FixedTask[];
  removeFixedTask: (id: string) => void;
  newFixed: string;
  setNewFixed: (v: string) => void;
  addFixedTask: (title: string) => void;
};

export function FixedView({
  fixedTasks,
  removeFixedTask,
  newFixed,
  setNewFixed,
  addFixedTask,
}: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400 dark:text-gray-500">
        毎日自動で追加される繰り返しタスクです
      </p>

      {/* 固定タスク一覧 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {fixedTasks.length === 0 ? (
          <p className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
            固定タスクがありません
          </p>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-700">
            {fixedTasks.map((ft) => (
              <li key={ft.id} className="flex items-center px-4 py-3 gap-3">
                <span className="text-gray-300 dark:text-gray-600 select-none">≡</span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                  {ft.title}
                </span>
                <button
                  onClick={() => removeFixedTask(ft.id)}
                  className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 固定タスク追加フォーム */}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const t = newFixed.trim();
          if (t) {
            addFixedTask(t);
            setNewFixed("");
          }
        }}
      >
        <Input
          value={newFixed}
          onChange={setNewFixed}
          placeholder="固定タスクを追加..."
          focusColor="blue"
        />
        <Button type="submit" variant="secondary">
          追加
        </Button>
      </form>
    </div>
  );
}
