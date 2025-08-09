import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  User,
  Gift,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import type { AccountStatus } from "../types";

// 狀態圖標映射
export const getStatusIcon = (status: AccountStatus): LucideIcon => {
  switch (status) {
    case "validating":
      return Loader2;
    case "processing":
      return Loader2;
    case "success":
      return CheckCircle2;
    case "error":
      return XCircle;
    case "idle":
    default:
      return Clock;
  }
};

// 狀態顏色映射（適合深色主題）
export const getStatusColor = (status: AccountStatus): string => {
  switch (status) {
    case "validating":
      return "text-blue-400";
    case "processing":
      return "text-orange-400";
    case "success":
      return "text-green-400";
    case "error":
      return "text-red-400";
    case "idle":
    default:
      return "text-gray-400";
  }
};

// 狀態背景色映射（適合深色主題）
export const getStatusBgColor = (status: AccountStatus): string => {
  switch (status) {
    case "validating":
      return "border-blue-400/30 bg-blue-400/5";
    case "processing":
      return "border-orange-400/30 bg-orange-400/5";
    case "success":
      return "border-green-400/30 bg-green-400/5";
    case "error":
      return "border-red-400/30 bg-red-400/5";
    case "idle":
    default:
      return "border-gray-600/30 bg-gray-600/5";
  }
};

// 狀態描述映射
export const getStatusDescription = (status: AccountStatus): string => {
  switch (status) {
    case "validating":
      return "驗證中";
    case "processing":
      return "處理中";
    case "success":
      return "成功";
    case "error":
      return "錯誤";
    case "idle":
    default:
      return "待處理";
  }
};

// 統計相關的圖標映射
export const getStatsIcon = (type: string): LucideIcon => {
  switch (type) {
    case "total":
      return User;
    case "validated":
      return CheckCircle2;
    case "processing":
      return Loader2;
    case "success":
      return Gift;
    case "error":
      return AlertCircle;
    default:
      return Clock;
  }
};

// 統計相關的顏色映射
export const getStatsColor = (type: string): string => {
  switch (type) {
    case "total":
      return "text-blue-600";
    case "validated":
      return "text-green-600";
    case "processing":
      return "text-orange-600";
    case "success":
      return "text-emerald-600";
    case "error":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// 統計相關的背景顏色映射
export const getStatsBgColor = (type: string): string => {
  switch (type) {
    case "total":
      return "bg-blue-50";
    case "validated":
      return "bg-green-50";
    case "processing":
      return "bg-orange-50";
    case "success":
      return "bg-emerald-50";
    case "error":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
};
