// Vercel Cronから呼ばれて、QStashに通知スケジュールを登録するAPIルート
// 毎日JST 0時に起動し、その日のユーザー設定に基づいた時刻を予約する

import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { NotificationSettings } from "@/lib/types";

// クライアントを返す関数（リクエスト時に初期化することでビルドエラーを防ぐ）
function getClients() {
  const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return { qstash, redis };
}

// 土曜(6)・日曜(0)かどうかを判定する
function isHoliday(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// 通知設定から今日送るべき時刻一覧を返す（例: ["18:00", "22:00"]）
function getActiveTimes(
  settings: NotificationSettings,
  todayJST: Date,
): string[] {
  const target = isHoliday(todayJST) ? settings.holiday : settings.weekday;
  return target.enabled ? target.times : [];
}

// Vercel CronはGETリクエストを送るのでGETで受け取る
export async function GET() {
  const { qstash, redis } = getClients();

  // Push購読情報がなければ通知できないので早期リターン
  const subscription = await redis.get("push-subscription");
  if (!subscription) {
    return NextResponse.json({ ok: false, reason: "no subscription" });
  }

  // Redisからユーザーの通知設定を読む
  const settings = await redis.get<NotificationSettings>(
    "notification-settings",
  );
  if (!settings) {
    return NextResponse.json({ ok: false, reason: "no notification settings" });
  }

  // 今日のJST日付・曜日を取得する
  const nowJST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );

  // 今日送るべき時刻一覧（例: ["18:00", "20:00", "22:00"]）
  const times = getActiveTimes(settings, nowJST);
  if (times.length === 0) {
    return NextResponse.json({ ok: true, scheduled: [] });
  }

  const notificationUrl = `${process.env.BASE_URL}/api/send-notification`;

  for (const time of times) {
    // "HH:MM" を 時・分の数値に分解する
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const notifyAt = new Date(nowJST);
    notifyAt.setHours(hour, minute, 0, 0);

    const notBefore = Math.floor(notifyAt.getTime() / 1000);

    // QStashにジョブを登録する（指定時刻に notificationUrl を呼ぶ）
    await qstash.publishJSON({
      url: notificationUrl,
      body: {},
      notBefore,
    });
  }

  return NextResponse.json({ ok: true, scheduled: times });
}
