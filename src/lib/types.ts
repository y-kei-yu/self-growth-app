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

export interface AppStorage {
  fixedTasks: FixedTask[];
  dailyTasks: Record<string, DailyTask[]>; // keyed by YYYY-MM-DD
  dayRecords: Record<string, DayRecord>;
  notificationPermission: boolean;
  lastResetDate: string;
}
