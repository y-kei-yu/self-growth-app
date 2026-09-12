// QStashから呼ばれて実際にPush通知を送るAPIルート
// 送信前に「今日タスクを達成済みか」を確認し、達成済みなら送らない

import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import webPush from "web-push";

// Redisクライアントを返す関数（リクエスト時に初期化することでビルドエラーを防ぐ）
function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// 心理的プレッシャーをかける文言
const PRESSURE_MESSAGES = [
  "まだ達成していない。今日もサボるの？",
  "このまま終わらせるの？本当にそれでいいの？",
  "あと少しで日付が変わる。逃げるな。",
  "今日も未達成で終わらせるの？",
  "記録が汚れる前に、今すぐタスクをやれ。",
  "自分との約束を破り続けて、それでいいの？",
];

// 今日の日付をキーとして使う（例: "achievement-2026-09-10"）
function getTodayAchievementKey(): string {
  const jstDate = new Date()
    .toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
  return `achievement-${jstDate}`;
}

// Redisから購読情報を取り出してPush通知を送る
export async function POST() {
  const redis = getRedis();

  // VAPIDキーの設定（web-pushライブラリに認証情報を渡す）
  webPush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const achievementVal = await redis.get<string>(getTodayAchievementKey());
  if (achievementVal === "true") {
    return NextResponse.json({ ok: false, reason: "already achieved" });
  }

  // Push購読情報を取得する
  const subscriptionJson = (await redis.get("push-subscription")) as
    | string
    | null;
  if (!subscriptionJson) {
    return NextResponse.json({ ok: false, reason: "no subscription" });
  }

  const message =
    PRESSURE_MESSAGES[Math.floor(Math.random() * PRESSURE_MESSAGES.length)];

  try {
    await webPush.sendNotification(
      JSON.parse(subscriptionJson),
      JSON.stringify({ title: "Self Growth", body: message }),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return NextResponse.json({
      ok: false,
      reason: "failed to send notification",
    });
  }
}
