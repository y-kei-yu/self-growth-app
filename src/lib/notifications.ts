// 通知のユーティリティ関数
// 役割: 通知許可の取得・Service Workerの登録・通知の送信

// 未達成のとき通知を送る時間帯
const NOTIFICATION_HOURS = [18, 20, 21, 22, 23];

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
  return PRESSURE_MESSAGES[Math.floor(Math.random() * PRESSURE_MESSAGES.length)];
}

// 通知の許可を求める
// 戻り値: 許可されたらtrue、されなかったらfalse
export async function requestNotificationPermission(): Promise<boolean> {
  // ブラウザが通知をサポートしているか確認
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  // ポップアップで許可を求める
  const result = await Notification.requestPermission();
  return result === "granted";
}

// Service Workerを登録する
// Service Worker = バックグラウンドで動く特別なJS
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
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
  if (typeof window === "undefined" || Notification.permission !== "granted") return;
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

// 今日の通知済みの時間一覧をlocalStorageから取得する
function getNotifiedHours(): number[] {
  if (typeof window === "undefined") return [];
  const today = new Date().toISOString().split("T")[0];
  try {
    const raw = localStorage.getItem(`notified-${today}`);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

// この時間に通知済みとしてlocalStorageに記録する
function markHourNotified(hour: number): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().split("T")[0];
  const hours = getNotifiedHours();
  if (!hours.includes(hour)) {
    hours.push(hour);
    localStorage.setItem(`notified-${today}`, JSON.stringify(hours));
  }
}

// 今の時間に通知すべきか確認して、必要なら通知する
// 呼び出し元: useNotificationsフック（30秒ごとに実行）
export async function checkAndNotify(isAchieved: boolean): Promise<void> {
  // 達成済みなら通知しない
  if (isAchieved) return;
  if (typeof window === "undefined" || Notification.permission !== "granted") return;

  const hour = new Date().getHours();

  // 通知する時間帯でなければ何もしない
  if (!NOTIFICATION_HOURS.includes(hour)) return;

  // この時間にすでに通知済みなら何もしない
  if (getNotifiedHours().includes(hour)) return;

  await showPressureNotification();
  markHourNotified(hour);
}
