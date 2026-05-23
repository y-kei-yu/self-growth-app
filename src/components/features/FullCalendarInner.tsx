// FullCalendarを直接使う内部コンポーネント
// このファイルはブラウザ専用（CalendarView.tsxからdynamicインポートされる）
// FullCalendarとプラグインはここで直接importする

"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { DayRecord } from "@/lib/types";

type Props = {
  events: Array<{
    start: string;
    display: string;
    backgroundColor: string;
  }>;
};

export default function FullCalendarInner({ events }: Props) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth" // 月表示
      locale="ja" // 日本語
      events={events}
      headerToolbar={{
        left: "prev",
        center: "title",
        right: "next",
      }}
      height="auto"
    />
  );
}
