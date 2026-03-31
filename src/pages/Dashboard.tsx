import React, { useEffect, useState, useRef } from "react";
import { Shield, AlertTriangle, CheckCircle2, Activity, Zap, Lock, Globe, Mail, FileText, Code, Image, Bell, X, ArrowUpRight, Server, Cpu, Database, HardDrive, TrendingUp, Map as MapIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { useNotifications } from "../lib/NotificationContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import * as d3 from 'd3';

const chartData = [
  { name: 'Mon', threats: 120, scans: 450 },
  { name: 'Tue', threats: 150, scans: 520 },
  { name: 'Wed', threats: 180, scans: 480 },
  { name: 'Thu', threats: 140, scans: 610 },
  { name: 'Fri', threats: 210, scans: 550 },
  { name: 'Sat', threats: 160, scans: 420 },
  { name: 'Sun', threats: 190, scans: 490 },
];

const mapPoints = [
  { x: 150, y: 80, label: "North America", risk: "Low" },
  { x: 450, y: 70, label: "Europe", risk: "Medium" },
  { x: 650, y: 120, label: "Asia", risk: "High" },
  { x: 200, y: 220, label: "South America", risk: "Low" },
  { x: 480, y: 200, label: "Africa", risk: "Medium" },
  { x: 720, y: 250, label: "Australia", risk: "Low" },
];

const stats = [
  { 
    label: "Threats Blocked", 
    value: "1,284", 
    icon: Shield, 
    color: "text-cyan-400", 
    bg: "bg-cyan-500/10",
    trend: "+12.5%",
    details: {
      description: "Total malicious attempts neutralized by the firewall and AI detectors in the last 30 days.",
      breakdown: [
        { label: "Phishing Attempts", value: 842 },
        { label: "Malicious URLs", value: 312 },
        { label: "Brute Force", value: 130 }
      ],
      recent: ["Blocked IP: 192.168.45.12 (Phishing)", "Blocked IP: 45.23.11.90 (SQL Injection)"]
    }
  },
  { 
    label: "Active Scans", 
    value: "12", 
    icon: Activity, 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10",
    trend: "Live",
    details: {
      description: "Security scans currently running across system modules and network endpoints.",
      breakdown: [
        { label: "URL Reputation Scans", value: 5 },
        { label: "Code Vulnerability Scans", value: 3 },
        { label: "Log Analysis Tasks", value: 4 }
      ],
      recent: ["Scan #842: Phishing DB Sync (92%)", "Scan #843: System Log Audit (45%)"]
    }
  },
  { 
    label: "Risk Level", 
    value: "Low", 
    icon: Zap, 
    color: "text-amber-400", 
    bg: "bg-amber-500/10",
    trend: "Stable",
    details: {
      description: "Aggregated security risk score based on recent activity, vulnerabilities, and threat intelligence.",
      breakdown: [
        { label: "Network Vulnerabilities", value: "Minimal" },
        { label: "Unpatched Systems", value: "0" },
        { label: "Suspicious Logins", value: "2 (Investigated)" }
      ],
      recent: ["Risk downgraded from Medium to Low (2h ago)", "All critical patches applied"]
    }
  },
  { 
    label: "System Health", 
    value: "98%", 
    icon: Lock, 
    color: "text-blue-400", 
    bg: "bg-blue-500/10",
    trend: "Optimal",
    details: {
      description: "Overall system operational status, resource utilization, and security uptime.",
      breakdown: [
        { label: "CPU Usage", value: "12%" },
        { label: "Memory Usage", value: "4.2GB / 16GB" },
        { label: "Security Uptime", value: "99.99%" }
      ],
      recent: ["Database optimization completed", "Node health check: All systems nominal"]
    }
  },
];

const features = [
  { id: "phishing", label: "Phishing Detector", icon: Mail, desc: "Analyze suspicious emails and messages for scam patterns." },
  { id: "url", label: "URL Scanner", icon: Globe, desc: "Check links for malicious domains and phishing sites." },
  { id: "logs", label: "Log Analyzer", icon: FileText, desc: "Detect anomalies and brute force attempts in system logs." },
  { id: "code", label: "Code Scanner", icon: Code, desc: "Identify vulnerabilities like SQLi and XSS in source code." },
  { id: "deepfake", label: "Deepfake Detector", icon: Image, desc: "Verify authenticity of images and news content." },
];

export default function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { notifications, addNotification } = useNotifications();
  const [selectedStat, setSelectedStat] = useState<typeof stats[0] | null>(null);
  const mapRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const svg = d3.select(mapRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 300;

    // Draw background grid
    svg.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(d3.range(0, width, 40))
      .enter()
      .append("line")
      .attr("x1", d => d)
      .attr("y1", 0)
      .attr("x2", d => d)
      .attr("y2", height)
      .attr("stroke", "rgba(255,255,255,0.03)")
      .attr("stroke-width", 1);

    svg.append("g")
      .attr("class", "grid-h")
      .selectAll("line")
      .data(d3.range(0, height, 40))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", d => d)
      .attr("x2", width)
      .attr("y2", d => d)
      .attr("stroke", "rgba(255,255,255,0.03)")
      .attr("stroke-width", 1);

    // Draw points
    const points = svg.selectAll(".point")
      .data(mapPoints)
      .enter()
      .append("g")
      .attr("class", "point")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    points.append("circle")
      .attr("r", 4)
      .attr("fill", d => d.risk === "High" ? "#ef4444" : d.risk === "Medium" ? "#f59e0b" : "#06b6d4")
      .attr("class", "animate-pulse");

    points.append("circle")
      .attr("r", 12)
      .attr("fill", "none")
      .attr("stroke", d => d.risk === "High" ? "#ef4444" : d.risk === "Medium" ? "#f59e0b" : "#06b6d4")
      .attr("stroke-width", 1)
      .attr("opacity", 0.3)
      .append("animate")
      .attr("attributeName", "r")
      .attr("from", "4")
      .attr("to", "24")
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite");

    points.append("text")
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .text(d => d.label);

  }, []);

  // Seed initial notifications if empty (for demo purposes)
  useEffect(() => {
    if (notifications.length === 0) {
      const seedData = [
        { title: "Suspicious Login", message: "Suspicious login attempt from 192.168.1.45", type: "error" as const },
        { title: "System Update", message: "System update completed successfully", type: "success" as const },
        { title: "New Device", message: "New device authorized: MacBook Pro", type: "info" as const },
        { title: "Failed SSH", message: "Multiple failed SSH attempts detected", type: "warning" as const },
      ];
      seedData.forEach(notif => addNotification(notif));
    }
  }, [notifications.length, addNotification]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return Activity;
      case 'success': return CheckCircle2;
      default: return Shield;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'error': return "text-red-500 dark:text-red-400";
      case 'warning': return "text-amber-500 dark:text-amber-400";
      case 'success': return "text-emerald-500 dark:text-emerald-400";
      default: return "text-cyan-500 dark:text-cyan-400";
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-12 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-200 tracking-tight">Security Overview</h1>
          <p className="text-slate-500 font-medium">Real-time threat intelligence and system monitoring.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 px-4 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-mono shadow-sm transition-colors duration-300">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>LAST SCAN: 2 MIN AGO</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedStat(stat)}
            className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-cyan-500/30 dark:hover:border-slate-700/50 transition-all group shadow-sm dark:shadow-none text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-600 font-mono uppercase tracking-widest">{stat.trend}</div>
            </div>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{stat.value}</p>
              <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-cyan-500 transition-colors" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Threat Intelligence Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-cyan-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-200">Threat Activity</h3>
                </div>
                <select className="bg-transparent text-xs font-mono text-slate-500 border-none focus:ring-0">
                  <option>LAST 7 DAYS</option>
                  <option>LAST 30 DAYS</option>
                </select>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      hide 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="threats" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorThreats)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm dark:shadow-none overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <MapIcon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-200">Global Threat Map</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500">LIVE FEED</span>
                </div>
              </div>
              <div className="relative aspect-[16/6] w-full flex items-center justify-center">
                <svg 
                  ref={mapRef} 
                  viewBox="0 0 800 300" 
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Live Network Status */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200">Live Network Status</h3>
                  <p className="text-sm text-slate-500">Real-time monitoring of critical infrastructure nodes.</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Total Traffic</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-200">1.2 GB/s</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Nodes</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-200">128 / 130</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Main Gateway", status: "Online", load: "45%", icon: Globe, color: "text-emerald-500" },
                { label: "Auth Server", status: "Online", load: "12%", icon: Lock, color: "text-emerald-500" },
                { label: "AI Engine", status: "Heavy Load", load: "88%", icon: Cpu, color: "text-amber-500" },
                { label: "Database", status: "Online", load: "32%", icon: Database, color: "text-emerald-500" },
              ].map((node, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <node.icon className={cn("w-4 h-4", node.color)} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", node.color)}>{node.status}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">{node.label}</p>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: node.load }}
                      className={cn("h-full", node.color.replace('text-', 'bg-'))}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">LOAD: {node.load}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">Security Modules</h2>
            <button className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors font-medium">View All Reports</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group shadow-sm dark:shadow-none"
              >
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 mb-4 group-hover:border-cyan-500/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{feature.label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">Recent Alerts</h2>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((alert, i) => {
                const Icon = getIcon(alert.type);
                const color = getColor(alert.type);
                return (
                  <div key={alert.id} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group">
                    <div className={cn("mt-1", color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm text-slate-700 dark:text-slate-300 leading-tight",
                        !alert.read ? "font-bold" : "font-medium"
                      )}>{alert.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", color)}>{alert.type}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-mono">{formatTime(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <Bell className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No alerts found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedStat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800", selectedStat.bg)}>
                      <selectedStat.icon className={cn("w-7 h-7", selectedStat.color)} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 tracking-tight">{selectedStat.label}</h2>
                      <p className="text-slate-500 font-medium">Detailed Analytics & Logs</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedStat(null)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-2 block">Overview</label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {selectedStat.details.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-2 block">Breakdown</label>
                      {selectedStat.details.breakdown.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-2 block">Recent Activity</label>
                      <div className="space-y-3">
                        {selectedStat.details.recent.map((log: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono leading-relaxed">{log}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Live Status</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        System is continuously monitoring for anomalies. Last integrity check passed at {new Date().toLocaleTimeString()}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => setSelectedStat(null)}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
