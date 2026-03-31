import React, { useState } from "react";
import { Globe, Search, ShieldAlert, Info } from "lucide-react";
import { analyzeURL, AnalysisResult } from "@/src/lib/gemini";
import ResultPanel from "@/src/components/ResultPanel";
import { logThreat, auth } from "@/src/lib/firebase";
import { useNotifications } from "../lib/NotificationContext";

export default function URLScanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { addNotification } = useNotifications();

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeURL(url);
      setResult(res);
      if (auth.currentUser) {
        await logThreat(auth.currentUser.uid, "url", res);

        // Add notification if risk is high
        if (res.risk_level === 'High' || res.risk_level === 'Critical') {
          await addNotification({
            title: "Malicious URL Detected",
            message: `A ${res.risk_level} risk URL was detected: ${url}`,
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
          <Globe className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-200 tracking-tight">URL Scanner</h1>
          <p className="text-slate-500 font-medium mt-2">Scan links for malicious domains, phishing patterns, and security risks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">Target URL</label>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest">
                <ShieldAlert className="w-3 h-3" />
                <span>DOMAIN REPUTATION CHECK</span>
              </div>
            </div>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/suspicious-link"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !url.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>SCAN URL REPUTATION</span>
            </button>
          </div>

          <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex items-start gap-4 transition-colors duration-300">
            <div className="mt-1 text-cyan-500/50">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              Our AI checks domain age, SSL status, and known phishing databases to provide a comprehensive trust score.
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
