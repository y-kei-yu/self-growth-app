// 今日の達成状況をRedisに保存・取得するAPIルート
// タスクを完了するたびに呼ばれ、send-notificationが送信前に確認する

import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 今日の日付をキーとして使う（例: "achievement-2026-09-10"）
function getTodayKey(): string {
  // en-CA ロケールは "YYYY-MM-DD" 形式で日付を返すのでキーの生成に便利
  const jstDate = new Date()
    .toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
  return `achievement-${jstDate}`;
}

// 達成状況を保存する（タスク完了時にフロントから呼ぶ）
export async function POST(req: Request) {
  const { achieved }: { achieved: boolean } = await req.json();
  const key = getTodayKey();
  await redis.set(key, String(achieved), { ex: 86400 });
  return NextResponse.json({ ok: true });
}

// 達成状況を確認する（send-notificationが送信前に呼ぶ）
export async function GET() {
  const key = getTodayKey();

  const val = await redis.get<string>(key);
  return NextResponse.json({ achieved: val === "true" });
}
