// Push購読をRedisに保存・削除するAPIルート

import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Redisクライアントを返す関数（リクエスト時に初期化することでビルドエラーを防ぐ）
function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// Push購読を保存する(通知を許可したとき)
export async function POST(req: Request) {
  const redis = getRedis();
  const subscription = await req.json();
  await redis.set("push-subscription", JSON.stringify(subscription));
  return NextResponse.json({ ok: true }, { status: 200 });
}

// Push購読を削除する（通知を無効にしたとき）
export async function DELETE() {
  const redis = getRedis();
  await redis.del("push-subscription");
  return NextResponse.json({ ok: true }, { status: 200 });
}
