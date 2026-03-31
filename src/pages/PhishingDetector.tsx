import React, { useState } from "react";
import { Mail, Send, AlertTriangle, Info } from "lucide-react";
import { analyzePhishing, AnalysisResult } from "@/src/lib/gemini";
import ResultPanel from "@/src/components/ResultPanel";
import { logThreat, auth } from "@/src/lib/firebase";
import { useNotifications } from "../lib/NotificationContext";

export default function PhishingDetector() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { addNotification } = useNotifications();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await analyzePhishing(text);
      setResult(res);
      if (auth.currentUser) {
        await logThreat(auth.currentUser.uid, "phishing", res);
        
        // Add notification if risk is high
        if (res.risk_level === 'High' || res.risk_level === 'Critical') {
          await addNotification({
            title: "Phishing Threat Detected",
            message: `A ${res.risk_level} risk phishing attempt was detected in your recent scan.`,
            type: "error"
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
          <Mail className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-200 tracking-tight">Phishing Detector</h1>
          <p className="text-slate-500 font-medium mt-2">Analyze suspicious emails, SMS, and messages for phishing patterns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">Input Message</label>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest">
                <Info className="w-3 h-3" />
                <span>AI ANALYSIS ENABLED</span>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the email content or message here..."
              className="w-full h-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-mono text-sm leading-relaxed"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span>ANALYZE THREAT VECTORS</span>
            </button>
          </div>

          <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex items-start gap-4 transition-colors duration-300">
            <div className="mt-1 text-amber-500/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              Privacy Notice: Our AI analyzes content in real-time. Do not include sensitive PII (Personally Identifiable Information) like passwords or credit card numbers in the analysis.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <ResultPanel result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
}
