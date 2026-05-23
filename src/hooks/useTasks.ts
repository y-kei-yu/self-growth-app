"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadStorage,
  saveStorage,
  getOrCreateDailyTasks,
  saveDayRecord,
  getTodayStr,
  generateId,
  calcCompletionRate,
  isAchieved,
} from "@/lib/storage";
import { AppStorage, DailyTask, FixedTask } from "@/lib/types";

export function useTasks() {
  const [storage, setStorage] = useState<AppStorage | null>(null);
  const today = getTodayStr();

  useEffect(() => {
    const s = loadStorage();
    // Seed today's tasks if not yet created
    if (!s.dailyTasks[today]) {
      const tasks = getOrCreateDailyTasks(s, today);
      s.dailyTasks[today] = tasks;
      saveStorage(s);
    }
    setStorage(s);
  }, [today]);

  const updateStorage = useCallback((updater: (s: AppStorage) => AppStorage) => {
    setStorage((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveStorage(next);
      return next;
    });
  }, []);

  const todayTasks: DailyTask[] = storage?.dailyTasks[today] ?? [];

  const toggleTask = useCallback(
    (taskId: string) => {
      updateStorage((s) => {
        const tasks = (s.dailyTasks[today] ?? []).map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const next = { ...s, dailyTasks: { ...s.dailyTasks, [today]: tasks } };
        return saveDayRecord(next, today, tasks);
      });
    },
    [today, updateStorage]
  );

  const addTodayTask = useCallback(
    (title: string) => {
      updateStorage((s) => {
        const task: DailyTask = {
          id: generateId(),
          title,
          completed: false,
          isFixed: false,
          date: today,
        };
        const tasks = [...(s.dailyTasks[today] ?? []), task];
        const next = { ...s, dailyTasks: { ...s.dailyTasks, [today]: tasks } };
        return saveDayRecord(next, today, tasks);
      });
    },
    [today, updateStorage]
  );

  const removeTodayTask = useCallback(
    (taskId: string) => {
      updateStorage((s) => {
        const tasks = (s.dailyTasks[today] ?? []).filter((t) => t.id !== taskId);
        const next = { ...s, dailyTasks: { ...s.dailyTasks, [today]: tasks } };
        return saveDayRecord(next, today, tasks);
      });
    },
    [today, updateStorage]
  );

  const addFixedTask = useCallback(
    (title: string) => {
      updateStorage((s) => {
        const ft: FixedTask = {
          id: generateId(),
          title,
          order: s.fixedTasks.length,
        };
        // Also add to today
        const dailyTask: DailyTask = {
          id: `${today}-${ft.id}`,
          title,
          completed: false,
          isFixed: true,
          fixedTaskId: ft.id,
          date: today,
        };
        const todayList = [...(s.dailyTasks[today] ?? []), dailyTask];
        const next = {
          ...s,
          fixedTasks: [...s.fixedTasks, ft],
          dailyTasks: { ...s.dailyTasks, [today]: todayList },
        };
        return saveDayRecord(next, today, todayList);
      });
    },
    [today, updateStorage]
  );

  const removeFixedTask = useCallback(
    (fixedTaskId: string) => {
      updateStorage((s) => {
        const tasks = (s.dailyTasks[today] ?? []).filter(
          (t) => t.fixedTaskId !== fixedTaskId
        );
        const next = {
          ...s,
          fixedTasks: s.fixedTasks.filter((f) => f.id !== fixedTaskId),
          dailyTasks: { ...s.dailyTasks, [today]: tasks },
        };
        return saveDayRecord(next, today, tasks);
      });
    },
    [today, updateStorage]
  );

  const completionRate = calcCompletionRate(todayTasks);
  const achieved = isAchieved(todayTasks);

  return {
    storage,
    todayTasks,
    completionRate,
    achieved,
    toggleTask,
    addTodayTask,
    removeTodayTask,
    addFixedTask,
    removeFixedTask,
  };
}
