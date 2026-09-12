// Vercel Cronから呼ばれて、QStashに通知スケジュールを登録するAPIルート
// 毎日JST 0時に起動し、その日のユーザー設定に基づいた時刻を予約する

import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { NotificationSettings } from "@/lib/types";

// クライアントを返す関数（リクエスト時に初期化することでビルドエラーを防ぐ）
function getClients() {
  const qstash = new Client({
    token: process.env.QSTASH_TOKEN!,
    baseUrl: process.env.QSTASH_URL,
  });
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

  // 今日のJST日付を "YYYY-MM-DD" 形式で取得する
  const todayJST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });

  // UTC正午で作ることでUTC・JSTどちらでも同じ日付になり、getDay()が正しい曜日を返す
  const nowJST = new Date(`${todayJST}T12:00:00Z`);

  // 今日送るべき時刻一覧（例: ["18:00", "20:00", "22:00"]）
  const times = getActiveTimes(settings, nowJST);
  if (times.length === 0) {
    return NextResponse.json({ ok: true, scheduled: [] });
  }

  const notificationUrl = `${process.env.BASE_URL?.replace(/\/$/, "")}/api/send-notification`;

  for (const time of times) {
    // "HH:MM" を 時・分の数値に分解する
    const [hourStr, minuteStr] = time.split(":");

    // JST の時刻を "+09:00" 付きで指定することで UTC に正しく変換される
    const notifyAt = new Date(`${todayJST}T${hourStr.padStart(2, "0")}:${minuteStr.padStart(2, "0")}:00+09:00`);
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
