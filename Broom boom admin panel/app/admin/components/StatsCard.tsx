"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    positive?: boolean | null; // true = up, false = down, null = neutral
    label?: string;
  };
  subtitle?: string;
  color?: "amber" | "blue" | "emerald" | "purple" | "rose";
}

const colorStyles = {
  amber: {
    iconBg: "bg-amber-100 text-amber-600",
    borderHover: "hover:border-amber-400",
    badge: "text-amber-700 bg-amber-50",
  },
  blue: {
    iconBg: "bg-blue-100 text-blue-600",
    borderHover: "hover:border-blue-400",
    badge: "text-blue-700 bg-blue-50",
  },
  emerald: {
    iconBg: "bg-emerald-100 text-emerald-600",
    borderHover: "hover:border-emerald-400",
    badge: "text-emerald-700 bg-emerald-50",
  },
  purple: {
    iconBg: "bg-purple-100 text-purple-600",
    borderHover: "hover:border-purple-400",
    badge: "text-purple-700 bg-purple-50",
  },
  rose: {
    iconBg: "bg-rose-100 text-rose-600",
    borderHover: "hover:border-rose-400",
    badge: "text-rose-700 bg-rose-50",
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "amber",
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all duration-200 ${styles.borderHover} hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${styles.iconBg} shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5 font-medium">
              {trend.positive === true && (
                <span className="inline-flex items-center text-emerald-600 gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {trend.value}
                </span>
              )}
              {trend.positive === false && (
                <span className="inline-flex items-center text-rose-600 gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {trend.value}
                </span>
              )}
              {trend.positive === null && (
                <span className="inline-flex items-center text-slate-500 gap-0.5">
                  <Minus className="w-3.5 h-3.5" />
                  {trend.value}
                </span>
              )}
              {trend.label && <span className="text-slate-500">{trend.label}</span>}
            </div>
          ) : (
            <span />
          )}

          {subtitle && (
            <span className="text-slate-400 font-normal truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

