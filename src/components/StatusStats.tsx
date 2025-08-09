import React from "react";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Account } from "../types";
import {
  calculateAccountStats,
  formatPercentage,
  calculateProgress,
} from "../utils/statsUtils";
import { getStatsIcon, getStatsColor } from "../utils/statusUtils";

interface StatusStatsProps {
  accounts: Account[];
  processingRemaining?: number | null;
}

interface StatCardProps {
  label: string;
  value: number;
  type: string;
  isAnimated?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  type,
  isAnimated = false,
}) => {
  const Icon = getStatsIcon(type);
  const colorClass = getStatsColor(type);

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold mb-1 ${colorClass}`}>{value}</div>
      <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
        {isAnimated ? (
          <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Icon className="w-3 h-3" />
        )}
        {label}
      </div>
    </div>
  );
};

const StatusStats: React.FC<StatusStatsProps> = ({
  accounts,
  processingRemaining,
}) => {
  const stats = calculateAccountStats(accounts);
  const { t } = useTranslation();
  // 若有 processingRemaining 則以它顯示處理中剩餘數
  const processingDisplay =
    typeof processingRemaining === "number" && processingRemaining >= 0
      ? processingRemaining
      : stats.processing;
  const processedCount = stats.success + stats.error;
  const totalToProcess =
    typeof processingRemaining === "number" && processingRemaining >= 0
      ? processingRemaining + processedCount
      : stats.total;
  const processedProgress = calculateProgress(processedCount, totalToProcess);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 flex-shrink-0">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">
          {t("status.title")}
        </h2>
      </div>

      {stats.total === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t("status.addAccountsHint")}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              label={t("status.verified")}
              value={stats.validated}
              type="validated"
            />
            <StatCard
              label={t("status.processing")}
              value={processingDisplay}
              type="processing"
              isAnimated={processingDisplay > 0}
            />
            <StatCard
              label={t("status.success")}
              value={stats.success}
              type="success"
            />
            <StatCard
              label={t("status.error")}
              value={stats.error}
              type="error"
            />
          </div>

          {/* 進度條 */}
          {stats.processing > 0 || stats.success > 0 || stats.error > 0 ? (
            <div className="flex-shrink-0">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{t("status.progress")}</span>
                <span>{formatPercentage(processedProgress, 0)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processedProgress}%` }}
                ></div>
              </div>
            </div>
          ) : null}

          {/* 統計摘要 */}
          {stats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>{t("status.total")}：</span>
                <span className="text-blue-400 font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>{t("status.validationRate")}：</span>
                <span className="text-green-400 font-medium">
                  {formatPercentage(stats.validationRate)}
                </span>
              </div>
              {stats.validated > 0 && (
                <div className="flex justify-between mt-1">
                  <span>{t("status.successRate")}：</span>
                  <span className="text-emerald-400 font-medium">
                    {formatPercentage(stats.successRate)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusStats;
