// 通知を管理するReactフック
// 役割: Service Workerの登録・許可状態の管理・通知スケジュールの実行

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  requestNotificationPermission,
  registerServiceWorker,
  checkAndNotify,
  subscribeToPush,
} from "@/lib/notifications";
import { NotificationSettings } from "@/lib/types";
import { getActiveNotificationTimes } from "@/lib/storage";

export function useNotifications(
  isAchieved: boolean,
  notificationSettings: NotificationSettings,
) {
  // 通知の許可状態（"default"=未回答, "granted"=許可, "denied"=拒否）
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  // Service Workerが準備できているかどうか
  const [swReady, setSwReady] = useState(false);

  // アプリ起動時にService Workerを登録する
  useEffect(() => {
    registerServiceWorker().then((reg) => {
      if (reg) setSwReady(true);
    });
  }, []);

  // 現在の通知許可状態をブラウザから読み込む
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // 30秒ごとに「今、通知すべき時間か？」をチェックする
  useEffect(() => {
    if (!swReady) return;
    const check = () => {
      const notificationTime = getActiveNotificationTimes(
        notificationSettings,
        new Date(),
      );
      checkAndNotify(isAchieved, notificationTime);
    };
    check(); // ページ読み込み時に1回すぐ確認
    const interval = setInterval(check, 30_000); // 30秒ごとに確認
    return () => clearInterval(interval); // コンポーネント終了時にタイマーを止める
  }, [isAchieved, swReady, notificationSettings]);

  // 通知許可を求めるボタンから呼ばれる関数
  const askPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");

    if (granted) {
      await subscribeToPush();
    }
    return granted;
  }, []);

  return { permission, askPermission };
}
