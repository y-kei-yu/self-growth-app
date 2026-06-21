export interface FixedTask {
  id: string;
  title: string;
  order: number;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  isFixed: boolean;
  fixedTaskId?: string;
  date: string; // YYYY-MM-DD
}

export interface DayRecord {
  date: string;
  achieved: boolean;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
}

// 1つの区分（平日 or 休日）の通知設定
export interface NotificationTimeSettings {
  enabled: boolean; // ON/OFF
  times: string[]; // "HH:MM" 形式の文字列、最大5件
}

// 通知設定全体
export interface NotificationSettings {
  weekday: NotificationTimeSettings; // 月〜金
  holiday: NotificationTimeSettings; // 土・日
}

export interface AppStorage {
  fixedTasks: FixedTask[];
  dailyTasks: Record<string, DailyTask[]>; // keyed by YYYY-MM-DD
  dayRecords: Record<string, DayRecord>;
  notificationPermission: boolean;
  lastResetDate: string;
  notificationSettings: NotificationSettings;
}
