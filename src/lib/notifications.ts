// 通知のユーティリティ関数
// 役割: 通知許可の取得・Service Workerの登録・通知の送信

// 心理的プレッシャーをかける文言
const PRESSURE_MESSAGES = [
  "まだ達成していない。今日もサボるの？",
  "このまま終わらせるの？本当にそれでいいの？",
  "あと少しで日付が変わる。逃げるな。",
  "今日も未達成で終わらせるの？",
  "記録が汚れる前に、今すぐタスクをやれ。",
  "自分との約束を破り続けて、それでいいの？",
];

// ランダムにメッセージを1つ選ぶ
function getRandomMessage(): string {
  return PRESSURE_MESSAGES[
    Math.floor(Math.random() * PRESSURE_MESSAGES.length)
  ];
}

// 通知の許可を求める
// 戻り値: 許可されたらtrue、されなかったらfalse
export async function requestNotificationPermission(): Promise<boolean> {
  // ブラウザが通知をサポートしているか確認
  if (typeof window === "undefined" || !("Notification" in window))
    return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  // ポップアップで許可を求める
  const result = await Notification.requestPermission();
  return result === "granted";
}

// Service Workerを登録する
// Service Worker = バックグラウンドで動く特別なJS
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator))
    return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none", // 常に最新のService Workerを使う
    });
    return reg;
  } catch {
    return null;
  }
}

// プレッシャー通知を実際に表示する
export async function showPressureNotification(): Promise<void> {
  if (typeof window === "undefined" || Notification.permission !== "granted")
    return;
  try {
    // Service Worker経由で通知を表示（より確実に動く）
    const reg = await navigator.serviceWorker.ready;
    // vibrate はServiceWorker通知では有効だがTypeScriptの型定義が古いためキャストする
    await reg.showNotification("Self Growth", {
      body: getRandomMessage(),
      icon: "/favicon.ico",
      vibrate: [200, 100, 200],
    } as NotificationOptions & { vibrate: number[] });
  } catch {
    // Service Workerが使えない場合は直接表示
    new Notification("Self Growth", { body: getRandomMessage() });
  }
}

// base64url文字列をUint8Arrayに変換する（iOSのpushManager.subscribeに必要）
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const trimmed = base64String.trim();
  const padding = "=".repeat((4 - (trimmed.length % 4)) % 4);
  const base64 = (trimmed + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  const buffer = new ArrayBuffer(rawData.length);
  const uint8Array = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    uint8Array[i] = rawData.charCodeAt(i);
  }
  return uint8Array;
}

// PushSubscription（どのデバイスに送るかの情報）をサーバーに登録する
// 呼び出し元: useNotificationsフック（通知許可が取れたとき）
export async function subscribeToPush(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator))
    return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    return true;
  } catch (error) {
    console.error("subscribeToPush failed:", error);
    // デバッグ用: iPhoneでエラー内容を確認するためのアラート（確認後に削除する）
    if (typeof window !== "undefined") {
      window.alert("subscribeToPush error: " + String(error));
    }
    return false;
  }
}

// 今日の通知済みの時間一覧をlocalStorageから取得する
function getNotifiedTimes(): string[] {
  if (typeof window === "undefined") return [];
  const today = new Date().toISOString().split("T")[0];
  try {
    const raw = localStorage.getItem(`notified-${today}`);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// この時間に通知済みとしてlocalStorageに記録する
function markTimeNotified(time: string): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().split("T")[0];
  const times = getNotifiedTimes();
  if (!times.includes(time)) {
    times.push(time);
    localStorage.setItem(`notified-${today}`, JSON.stringify(times));
  }
}

// 今の時間に通知すべきか確認して、必要なら通知する
// 呼び出し元: useNotificationsフック（30秒ごとに実行）
export async function checkAndNotify(
  isAchieved: boolean,
  activeTimes: string[],
): Promise<void> {
  // 達成済みなら通知しない
  if (isAchieved) return;
  if (typeof window === "undefined" || Notification.permission !== "granted")
    return;

  // 現在時刻を "HH:MM" 形式の文字列にする
  const hours = String(new Date().getHours()).padStart(2, "0");
  const minutes = String(new Date().getMinutes()).padStart(2, "0");
  const current = `${hours}:${minutes}`;

  // 通知する時間帯でなければ何もしない
  if (!activeTimes.includes(current)) return;

  // この時間にすでに通知済みなら何もしない
  if (getNotifiedTimes().includes(current)) return;

  await showPressureNotification();
  markTimeNotified(current);
}
