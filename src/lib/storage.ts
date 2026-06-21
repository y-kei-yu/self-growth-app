import {
  AppStorage,
  DayRecord,
  DailyTask,
  FixedTask,
  NotificationSettings,
} from "./types";

const STORAGE_KEY = "self-growth-app";

export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const DEFAULT_NOTIFICATION_TIMES = [
  "18:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

function getDefaultStorage(): AppStorage {
  return {
    fixedTasks: [],
    dailyTasks: {},
    dayRecords: {},
    notificationPermission: false,
    lastResetDate: getTodayStr(),
    notificationSettings: {
      weekday: {
        enabled: true,
        times: [...DEFAULT_NOTIFICATION_TIMES],
      },
      holiday: {
        enabled: true,
        times: [...DEFAULT_NOTIFICATION_TIMES],
      },
    },
  };
}

export function loadStorage(): AppStorage {
  if (typeof window === "undefined") return getDefaultStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStorage();
    return { ...getDefaultStorage(), ...JSON.parse(raw) };
  } catch {
    return getDefaultStorage();
  }
}

export function saveStorage(data: AppStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getOrCreateDailyTasks(
  storage: AppStorage,
  date: string,
): DailyTask[] {
  if (storage.dailyTasks[date]) return storage.dailyTasks[date];

  // 固定タスクから今日のタスクを作成
  const tasks: DailyTask[] = storage.fixedTasks.map((ft) => ({
    id: `${date}-${ft.id}`,
    title: ft.title,
    completed: false,
    isFixed: true,
    fixedTaskId: ft.id,
    date,
  }));
  return tasks;
}

export function calcCompletionRate(tasks: DailyTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.completed).length;
  return done / tasks.length;
}

export function isAchieved(tasks: DailyTask[]): boolean {
  return calcCompletionRate(tasks) >= 0.7;
}

export function saveDayRecord(
  storage: AppStorage,
  date: string,
  tasks: DailyTask[],
): AppStorage {
  const rate = calcCompletionRate(tasks);
  const record: DayRecord = {
    date,
    achieved: rate >= 0.7,
    completionRate: rate,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.completed).length,
  };
  return {
    ...storage,
    dayRecords: { ...storage.dayRecords, [date]: record },
  };
}

export function calcStreak(dayRecords: Record<string, DayRecord>): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (i === 0) {
      // Today: count only if achieved
      const rec = dayRecords[key];
      if (rec?.achieved) streak++;
      else if (!rec)
        continue; // today not recorded yet, skip
      else break;
    } else {
      const rec = dayRecords[key];
      if (rec?.achieved) streak++;
      else break;
    }
  }
  return streak;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// 土曜(6)・日曜(0)なら休日
export function isHoliday(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// その日（平日/休日）で有効な通知時刻一覧を返す
export function getActiveNotificationTimes(
  settings: NotificationSettings,
  date: Date,
): string[] {
  const target = isHoliday(date) ? settings.holiday : settings.weekday;
  return target.enabled ? target.times : [];
}
