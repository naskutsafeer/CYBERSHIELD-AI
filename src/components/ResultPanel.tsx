import React from "react";
import { AlertTriangle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { AnalysisResult } from "@/src/lib/gemini";
import RiskMeter from "./RiskMeter";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";

interface ResultPanelProps {
  result: AnalysisResult | null;
  loading: boolean;
}

export default function ResultPanel({ result, loading }: ResultPanelProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-6 animate-pulse shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 dark:border-t-cyan-400 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900 dark:text-slate-200">Analyzing Threat Vectors...</p>
          <p className="text-sm text-slate-500 mt-2 font-mono">Running heuristic and AI pattern matching</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
          <Info className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Awaiting Input</p>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
            Provide content for analysis to generate a security risk report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center border",
              result.risk_level === "Low" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
              result.risk_level === "Medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" :
              "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            )}>
              {result.risk_level === "Low" ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">{result.threat}</h3>
              <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">Threat Analysis Report</p>
            </div>
          </div>
        </div>

        <RiskMeter level={result.risk_level} confidence={result.confidence} />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold">
              <Info className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span>Explanation</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              {result.explanation}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold">
              <ArrowRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Recommendation</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              {result.recommendation}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
