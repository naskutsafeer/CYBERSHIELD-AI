import React from "react";
import { Shield, Mail, Globe, FileText, Code, Image, LayoutDashboard, ShieldAlert } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "phishing", label: "Phishing Detector", icon: Mail },
  { id: "url", label: "URL Scanner", icon: Globe },
  { id: "logs", label: "Log Analyzer", icon: FileText },
  { id: "code", label: "Code Scanner", icon: Code },
  { id: "deepfake", label: "Deepfake Detector", icon: Image },
];

export default function Sidebar({ activeTab, setActiveTab, isAdmin }: SidebarProps) {
  return (
    <div className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
          <Shield className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
          CyberShield AI
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeTab === item.id ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest font-mono">Administration</p>
            <button
              onClick={() => setActiveTab("admin")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === "admin"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <ShieldAlert className={cn(
                "w-5 h-5 transition-colors",
                activeTab === "admin" ? "text-red-600 dark:text-red-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )} />
              <span className="font-medium">Admin Panel</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium font-mono uppercase">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
