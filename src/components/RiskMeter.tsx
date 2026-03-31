import React from "react";
import { cn } from "@/src/lib/utils";

interface RiskMeterProps {
  level: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
}

const levels = {
  Low: { color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Medium: { color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  High: { color: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Critical: { color: "bg-red-500", text: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export default function RiskMeter({ level, confidence }: RiskMeterProps) {
  const config = levels[level];

  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">Risk Assessment</p>
          <div className={cn("px-3 py-1 rounded-full border text-sm font-bold inline-block", config.bg, config.text, config.border)}>
            {level.toUpperCase()}
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">AI Confidence</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-200 font-mono">{(confidence * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
        <div
          className={cn("absolute top-0 left-0 h-full transition-all duration-1000 ease-out", config.color)}
          style={{ width: `${confidence * 100}%` }}
        />
        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1 pointer-events-none opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-px h-full bg-slate-400" />
          ))}
        </div>
      </div>
    </div>
  );
}
