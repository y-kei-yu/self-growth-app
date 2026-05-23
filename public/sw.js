// Service Worker
// ブラウザのバックグラウンドで動く特別なスクリプト
// 役割: 通知の表示、通知クリック時の処理

// インストール時: すぐにアクティブにする
self.addEventListener("install", () => self.skipWaiting());

// アクティベート時: 全タブを制御下に置く
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// 通知がクリックされたとき: アプリを前面に出す
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        // すでに開いているタブがあればそちらにフォーカス
        if (list.length > 0) return list[0].focus();
        // なければ新しいタブで開く
        return clients.openWindow("/");
      })
  );
});

// サーバーからのPush通知を受けたとき（将来の拡張用）
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Self Growth", {
      body: data.body,
      icon: "/favicon.ico",
      vibrate: [200, 100, 200],
    })
  );
});
