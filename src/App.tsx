import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signInWithGoogle, logout } from "./lib/firebase";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import PhishingDetector from "./pages/PhishingDetector";
import URLScanner from "./pages/URLScanner";
import LogAnalyzer from "./pages/LogAnalyzer";
import CodeScanner from "./pages/CodeScanner";
import DeepfakeDetector from "./pages/DeepfakeDetector";
import AdminPanel from "./pages/AdminPanel";
import FeedbackModal from "./components/FeedbackModal";
import { Shield, Lock, LogIn, Github, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { syncUserProfile, db } from "./lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    if (user) {
      syncUserProfile(user);
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.data());
        }
      });
      return () => unsubscribe();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-slate-500 font-mono text-sm animate-pulse">INITIALIZING SECURE SESSION...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.8)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:opacity-100 opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl shadow-cyan-500/5"
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-inner shadow-cyan-500/10">
              <Shield className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-200 tracking-tight">CyberShield AI</h1>
              <p className="text-slate-500 mt-2 font-medium">Advanced Cybersecurity Intelligence Platform</p>
            </div>

            <div className="w-full space-y-4 pt-4">
              <button
                onClick={signInWithGoogle}
                className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-white/5 active:scale-95"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
              <button
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
              >
                <Github className="w-5 h-5" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-600 font-mono uppercase tracking-widest pt-4">
              <Lock className="w-3 h-3" />
              <span>End-to-End Encrypted Session</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard setActiveTab={setActiveTab} />;
      case "phishing": return <PhishingDetector />;
      case "url": return <URLScanner />;
      case "logs": return <LogAnalyzer />;
      case "code": return <CodeScanner />;
      case "deepfake": return <DeepfakeDetector />;
      case "admin": return <AdminPanel />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  const isAdmin = userProfile?.role === "admin" || user?.email === "naskutsafeer321@gmail.com";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header setActiveTab={setActiveTab} onOpenFeedback={() => setIsFeedbackOpen(true)} />

        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="p-6 border-t border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-950/50 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-600 font-mono uppercase tracking-wider">
            <span>© 2026 CyberShield AI</span>
            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <span>v1.2.4-stable</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Feedback</span>
            </button>
            <button className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Privacy Policy</button>
            <button className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Terms of Service</button>
            <button onClick={logout} className="text-xs text-red-500/70 hover:text-red-400 transition-colors font-bold uppercase tracking-widest">Terminate Session</button>
          </div>
        </footer>
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
