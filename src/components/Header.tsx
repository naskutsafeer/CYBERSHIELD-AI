import React, { useEffect, useState, useRef } from "react";
import { Bell, Search, User, Mail, Globe, FileText, Code, Image, Shield, Command, Activity } from "lucide-react";
import { auth, db } from "@/src/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import ThemeToggle from "./ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { cn } from "@/src/lib/utils";

const searchItems = [
  { id: "dashboard", label: "Dashboard", icon: Shield, desc: "System overview and stats" },
  { id: "phishing", label: "Phishing Detector", icon: Mail, desc: "Analyze suspicious emails" },
  { id: "url", label: "URL Scanner", icon: Globe, desc: "Check links for malicious domains" },
  { id: "logs", label: "Log Analyzer", icon: FileText, desc: "Detect anomalies in system logs" },
  { id: "code", label: "Code Scanner", icon: Code, desc: "Identify vulnerabilities in source code" },
  { id: "deepfake", label: "Deepfake Detector", icon: Image, desc: "Verify authenticity of images" },
  { id: "admin", label: "Admin Panel", icon: Shield, desc: "Manage users and permissions" },
];

export default function Header({ setActiveTab, onOpenFeedback }: { setActiveTab: (tab: string) => void; onOpenFeedback: () => void }) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredItems = searchQuery.trim() === "" 
    ? [] 
    : searchItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.data());
        }
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search') as HTMLInputElement;
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-6 mr-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System Status</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ALL SYSTEMS NOMINAL</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-cyan-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Network Load</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200">12.4 TB/S</span>
          </div>
        </div>

        <div className="relative w-96 group" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
          <input
            id="global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search modules (e.g. 'phishing')..."
            className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-12 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-mono pointer-events-none">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>

          <AnimatePresence>
            {isSearchFocused && searchQuery.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                          <item.icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-200 group-hover:text-cyan-500 transition-colors">{item.label}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No modules found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Search Results</span>
                  <span className="text-[10px] text-slate-400 font-mono">ESC TO CLOSE</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenFeedback}
          title="Submit Feedback"
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative group"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Feedback
          </span>
        </button>
        <ThemeToggle />
        <NotificationCenter />
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
        <button className="flex items-center gap-3 p-1 pr-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 leading-none">
              {userProfile?.displayName || auth.currentUser?.displayName || "User"}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider">
              {userProfile?.role || "User"} Access
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
