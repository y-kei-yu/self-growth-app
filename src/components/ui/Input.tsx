// 汎用テキスト入力コンポーネント
// ダークモード対応済み

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  focusColor?: "green" | "blue"; // フォーカス時の枠線の色
};

export function Input({
  value,
  onChange,
  placeholder,
  focusColor = "green",
}: InputProps) {
  // フォーカス時の色をプロップスで切り替える
  const focusClass =
    focusColor === "green"
      ? "focus:ring-green-300 dark:focus:ring-green-700"
      : "focus:ring-blue-300 dark:focus:ring-blue-700";

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`flex-1 px-4 py-2.5 rounded-xl border text-sm transition-colors
        bg-white dark:bg-gray-700
        border-gray-200 dark:border-gray-600
        text-gray-800 dark:text-gray-100
        placeholder:text-gray-400 dark:placeholder:text-gray-500
        focus:outline-none focus:ring-2 ${focusClass}`}
    />
  );
}
