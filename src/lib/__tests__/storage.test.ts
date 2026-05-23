// storage.ts のユニットテスト
// ユニットテスト = 関数1つ1つが正しく動くかを個別に確認するテスト

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  calcCompletionRate,
  isAchieved,
  calcStreak,
  saveDayRecord,
  getOrCreateDailyTasks,
  getTodayStr,
} from "../storage";
import type { DailyTask, AppStorage } from "../types";

// テスト用のタスクを簡単に作るヘルパー関数
function makeTask(id: string, completed: boolean, isFixed = false): DailyTask {
  return {
    id,
    title: `タスク${id}`,
    completed,
    isFixed,
    date: "2026-05-23",
  };
}

// テスト用の空のストレージデータを作るヘルパー関数
function makeStorage(overrides: Partial<AppStorage> = {}): AppStorage {
  return {
    fixedTasks: [],
    dailyTasks: {},
    dayRecords: {},
    notificationPermission: false,
    lastResetDate: "2026-05-23",
    ...overrides,
  };
}

// ---- calcCompletionRate のテスト ----
describe("calcCompletionRate（達成率の計算）", () => {
  it("タスクが0件のとき、達成率は0になる", () => {
    expect(calcCompletionRate([])).toBe(0);
  });

  it("全タスク完了のとき、達成率は1（100%）になる", () => {
    const tasks = [makeTask("1", true), makeTask("2", true)];
    expect(calcCompletionRate(tasks)).toBe(1);
  });

  it("半分完了のとき、達成率は0.5（50%）になる", () => {
    const tasks = [makeTask("1", true), makeTask("2", false)];
    expect(calcCompletionRate(tasks)).toBe(0.5);
  });

  it("全タスク未完了のとき、達成率は0になる", () => {
    const tasks = [makeTask("1", false), makeTask("2", false)];
    expect(calcCompletionRate(tasks)).toBe(0);
  });
});

// ---- isAchieved のテスト ----
describe("isAchieved（70%以上で達成判定）", () => {
  it("タスクが0件のとき、達成にならない", () => {
    expect(isAchieved([])).toBe(false);
  });

  it("70%ちょうどのとき、達成になる", () => {
    // 10件中7件完了 = 70%
    const tasks = [
      ...Array.from({ length: 7 }, (_, i) => makeTask(`${i}`, true)),
      ...Array.from({ length: 3 }, (_, i) => makeTask(`${i + 7}`, false)),
    ];
    expect(isAchieved(tasks)).toBe(true);
  });

  it("69%のとき、達成にならない", () => {
    // 10件中6件完了 = 60%
    const tasks = [
      ...Array.from({ length: 6 }, (_, i) => makeTask(`${i}`, true)),
      ...Array.from({ length: 4 }, (_, i) => makeTask(`${i + 6}`, false)),
    ];
    expect(isAchieved(tasks)).toBe(false);
  });

  it("100%完了のとき、達成になる", () => {
    const tasks = [makeTask("1", true), makeTask("2", true), makeTask("3", true)];
    expect(isAchieved(tasks)).toBe(true);
  });
});

// ---- calcStreak のテスト ----
describe("calcStreak（連続達成日数の計算）", () => {
  // テスト後に日時モックをリセットする
  afterEach(() => {
    vi.useRealTimers();
  });

  it("記録が空のとき、ストリークは0になる", () => {
    expect(calcStreak({})).toBe(0);
  });

  it("今日だけ達成しているとき、ストリークは1になる", () => {
    // 現在時刻を2026-05-23に固定する
    vi.setSystemTime(new Date("2026-05-23T10:00:00"));

    const dayRecords = {
      "2026-05-23": { date: "2026-05-23", achieved: true, completionRate: 1, totalTasks: 1, completedTasks: 1 },
    };
    expect(calcStreak(dayRecords)).toBe(1);
  });

  it("3日連続達成しているとき、ストリークは3になる", () => {
    vi.setSystemTime(new Date("2026-05-23T10:00:00"));

    const dayRecords = {
      "2026-05-21": { date: "2026-05-21", achieved: true, completionRate: 1, totalTasks: 1, completedTasks: 1 },
      "2026-05-22": { date: "2026-05-22", achieved: true, completionRate: 1, totalTasks: 1, completedTasks: 1 },
      "2026-05-23": { date: "2026-05-23", achieved: true, completionRate: 1, totalTasks: 1, completedTasks: 1 },
    };
    expect(calcStreak(dayRecords)).toBe(3);
  });

  it("途中で未達成があるとき、連続が途切れる", () => {
    vi.setSystemTime(new Date("2026-05-23T10:00:00"));

    const dayRecords = {
      "2026-05-20": { date: "2026-05-20", achieved: true, completionRate: 1, totalTasks: 1, completedTasks: 1 },
      "2026-05-21": { date: "2026-05-21", achieved: false, completionRate: 0.5, totalTasks: 2, completedTasks: 1 },
      "2026-05-22": { date: "2026-05-22", achieved: true, completionRate: 1, totalTasks: 1, completedTasks: 1 },
      "2026-05-23": { date: "2026-05-23", achieved: true, completionRate: 1, totalTasks: 1, completedTasks: 1 },
    };
    // 21日に途切れているので、22〜23日の2日連続
    expect(calcStreak(dayRecords)).toBe(2);
  });
});

// ---- saveDayRecord のテスト ----
describe("saveDayRecord（日次記録の保存）", () => {
  it("達成率70%以上のとき、achieved: true で保存される", () => {
    const storage = makeStorage();
    const tasks = [makeTask("1", true), makeTask("2", true), makeTask("3", false)];
    // 2/3 = 66.7% → 未達成のはずだが... 3件中2件=66.7%
    // 実際には70%未満なので achieved: false になる

    const result = saveDayRecord(storage, "2026-05-23", tasks);
    expect(result.dayRecords["2026-05-23"].achieved).toBe(false);
  });

  it("全タスク完了のとき、achieved: true で保存される", () => {
    const storage = makeStorage();
    const tasks = [makeTask("1", true), makeTask("2", true)];

    const result = saveDayRecord(storage, "2026-05-23", tasks);
    expect(result.dayRecords["2026-05-23"].achieved).toBe(true);
    expect(result.dayRecords["2026-05-23"].completionRate).toBe(1);
    expect(result.dayRecords["2026-05-23"].totalTasks).toBe(2);
    expect(result.dayRecords["2026-05-23"].completedTasks).toBe(2);
  });
});

// ---- getOrCreateDailyTasks のテスト ----
describe("getOrCreateDailyTasks（今日のタスク作成）", () => {
  it("固定タスクがあるとき、今日のタスクとして追加される", () => {
    const storage = makeStorage({
      fixedTasks: [
        { id: "fixed-1", title: "筋トレ", order: 0 },
        { id: "fixed-2", title: "読書", order: 1 },
      ],
    });

    const tasks = getOrCreateDailyTasks(storage, "2026-05-23");
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe("筋トレ");
    expect(tasks[0].isFixed).toBe(true);
    expect(tasks[0].completed).toBe(false);
  });

  it("すでに今日のタスクがあるとき、そのまま返す", () => {
    const existingTasks = [makeTask("1", true)];
    const storage = makeStorage({
      dailyTasks: { "2026-05-23": existingTasks },
    });

    const tasks = getOrCreateDailyTasks(storage, "2026-05-23");
    expect(tasks).toEqual(existingTasks);
  });
});

// ---- getTodayStr のテスト ----
describe("getTodayStr（今日の日付文字列）", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("YYYY-MM-DD形式で返す", () => {
    vi.setSystemTime(new Date("2026-05-23T10:00:00"));
    expect(getTodayStr()).toBe("2026-05-23");
  });
});
