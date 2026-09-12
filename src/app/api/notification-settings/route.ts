// 通知設定をRedisに保存・取得するAPIルート
// Vercel Cronが「今日何時に通知すべきか」を読むために使う

import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { NotificationSettings } from "@/lib/types";

// Redisクライアントを返す関数（リクエスト時に初期化することでビルドエラーを防ぐ）
function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

const REDIS_KEY = "notification-settings";

// 通知設定を取得する（Cronが呼ぶ）
export async function GET() {
  const redis = getRedis();
  const settings = await redis.get<NotificationSettings>(REDIS_KEY);
  return NextResponse.json(settings ?? null);
}

// 通知設定を保存する（設定画面が呼ぶ）
export async function POST(req: Request) {
  const redis = getRedis();
  const settings: NotificationSettings = await req.json();
  await redis.set(REDIS_KEY, JSON.stringify(settings));
  return NextResponse.json({ ok: true });
}
