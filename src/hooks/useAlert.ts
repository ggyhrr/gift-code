import { useState, useCallback } from "react";
import type { AlertType, AlertState } from "../types";

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showAlert = useCallback((message: string, type: AlertType = "info") => {
    setAlert({
      message,
      type,
      isVisible: true,
    });

    // 3秒後自動隱藏 Alert
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      showAlert(message, "success");
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string) => {
      showAlert(message, "error");
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string) => {
      showAlert(message, "warning");
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string) => {
      showAlert(message, "info");
    },
    [showAlert]
  );

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
