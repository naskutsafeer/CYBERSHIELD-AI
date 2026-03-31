import React, { useState } from "react";
import { Code, Upload, Bug, Info, Terminal } from "lucide-react";
import { analyzeCode, AnalysisResult } from "@/src/lib/gemini";
import ResultPanel from "@/src/components/ResultPanel";
import { logThreat, auth } from "@/src/lib/firebase";

export default function CodeScanner() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeCode(code);
      setResult(res);
      if (auth.currentUser) {
        await logThreat(auth.currentUser.uid, "code", res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
          <Code className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-200 tracking-tight">Code Vulnerability Scanner</h1>
          <p className="text-slate-500 font-medium mt-2">Identify SQL injection, XSS, and other security flaws in your source code.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-mono">Source Code</label>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest">
                <Bug className="w-3 h-3" />
                <span>SAST ENGINE ACTIVE</span>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your source code here or upload a file..."
              className="w-full h-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-mono text-xs leading-relaxed"
            />
            <div className="flex gap-4">
              <label className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>UPLOAD FILE</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".js,.ts,.py,.java,.cpp,.php" />
              </label>
              <button
                onClick={handleAnalyze}
                disabled={loading || !code.trim()}
                className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Terminal className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>SCAN VULNERABILITIES</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex items-start gap-4 transition-colors duration-300">
            <div className="mt-1 text-emerald-500/50">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              Our AI performs Static Application Security Testing (SAST) to find common OWASP Top 10 vulnerabilities.
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
