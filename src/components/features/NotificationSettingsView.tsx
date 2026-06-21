"use client";

import { NotificationSettings } from "@/lib/types";
import { useState } from "react";
import { Button } from "../ui/Button";

type Props = {
    settings: NotificationSettings;
    onChange: (newSettings: NotificationSettings) => void;
};

type Section = "weekday" | "holiday";

const SECTION_LABELS: Record<Section, string> = {
    weekday: "平日（月〜金）",
    holiday: "休日（土・日）",
};

export function NotificationSettingsView({ settings, onChange }: Props) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">
                通知を送る時間帯を設定できます（各最大5件）
            </p>
            <NotificationSection
                section="weekday"
                value={settings.weekday}
                onChange={(next) => onChange({ ...settings, weekday: next })}
            />
            <NotificationSection
                section="holiday"
                value={settings.holiday}
                onChange={(next) => onChange({ ...settings, holiday: next })}
            />
        </div>
    );
}

function NotificationSection({
    section,
    value,
    onChange,
}: {
    section: Section;
    value: NotificationSettings[Section];
    onChange: (next: NotificationSettings[Section]) => void;
}) {
    // 追加フォームの入力値（"HH:MM"）
    const [newTime, setNewTime] = useState("");

    // ON/OFFトグルが押されたとき
    const toggleEnabled = () => {
        onChange({ ...value, enabled: !value.enabled });
    };

    // 「追加」ボタンが押されたとき
    const addTime = () => {
        if (newTime && value.times.length < 5 && !value.times.includes(newTime)) {
            const sortedTimes = [...value.times, newTime].sort();
            onChange({ ...value, times: sortedTimes });
            setNewTime("");
        }
    };
    // 「×」で時刻を削除するとき
    const removeTime = (time: string) => {
        onChange({ ...value, times: value.times.filter((t: string) => t !== time) });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 space-y-3">
            {/* タイトル + ON/OFFトグル */}
            <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                    {SECTION_LABELS[section]}
                </span>
                <button
                    onClick={toggleEnabled}
                    aria-label={value.enabled ? "通知をOFFにする" : "通知をONにする"}
                    className={`w-11 h-6 rounded-full transition-colors relative ${value.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value.enabled ? "translate-x-5" : ""
                            }`}
                    />
                </button>
            </div>

            {/* 登録済みの時刻一覧 */}
            <div className="flex flex-wrap gap-2">
                {value.times.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        時刻が設定されていません
                    </p>
                ) : (
                    value.times.map((time) => (
                        <span
                            key={time}
                            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-full pl-3 pr-2 py-1"
                        >
                            {time}
                            <button
                                onClick={() => removeTime(time)}
                                disabled={!value.enabled}
                                aria-label={`${time}を削除`}
                                className="text-gray-400 hover:text-red-400 text-base leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                ×
                            </button>
                        </span>
                    ))
                )}
            </div>

            {/* 追加フォーム */}
            <div className="flex gap-2 items-center">
                <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    disabled={!value.enabled || value.times.length >= 5}
                    className="flex-1 px-3 py-2 rounded-xl border text-base bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                />
                <Button
                    type="button"
                    variant="secondary"
                    onClick={addTime}
                    disabled={!value.enabled || value.times.length >= 5 || !newTime}
                >
                    追加
                </Button>
            </div>
            {value.times.length >= 5 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    最大5件まで設定できます
                </p>
            )}
        </div>
    );
}
