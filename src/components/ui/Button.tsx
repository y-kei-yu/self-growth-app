// 汎用ボタンコンポーネント
// variant（種類）を指定して色を変えられる
// ダークモード対応済み

type ButtonProps = {
  variant?: "primary" | "secondary" | "danger"; // ボタンの色の種類
  type?: "button" | "submit"; // フォーム送信用かどうか
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode; // ボタンの中に表示するテキストやアイコン
};

// 種類ごとのTailwindクラス
const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500",
  secondary:
    "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",
};

export function Button({
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  className = "",
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
