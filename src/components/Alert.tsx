import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AlertProps {
  message: string;
  type: "error" | "warning" | "info" | "success";
  onClose: () => void;
  isVisible: boolean;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose, isVisible }) => {
  const { t } = useTranslation();
  if (!isVisible) return null;

  const getAlertStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-900/90 border-red-600 text-red-100";
      case "warning":
        return "bg-yellow-900/90 border-yellow-600 text-yellow-100";
      case "success":
        return "bg-green-900/90 border-green-600 text-green-100";
      case "info":
      default:
        return "bg-blue-900/90 border-blue-600 text-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return <X className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "success":
        return <X className="w-5 h-5 text-green-400" />;
      case "info":
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`
          max-w-md w-full rounded-lg border-2 p-6 shadow-2xl backdrop-blur-sm
          ${getAlertStyles()}
          transform transition-all duration-300 ease-out
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label={t("alert.close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors"
          >
            {t("alert.ok")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
