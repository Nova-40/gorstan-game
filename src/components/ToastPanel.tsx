// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Component: ToastPanel.tsx

type ToastPanelProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClear: () => void;
};

const styleMap: Record<'success' | 'error' | 'info', string> = {
  success: 'bg-green-700',
  error: 'bg-red-700',
  info: 'bg-blue-700',
};

export default function ToastPanel({ message, type = 'info', onClear }: ToastPanelProps) {
  useEffect(() => {
        }, 3000);
    return () => clearTimeout(timeout);
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white ${styleMap[type]}`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
