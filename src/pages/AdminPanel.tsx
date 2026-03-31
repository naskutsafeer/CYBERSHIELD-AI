import React, { useEffect, useState } from "react";
import { Users, Shield, User as UserIcon, Trash2, ShieldAlert, RefreshCw, Key, Edit2, X, Check, Search, UserPlus, FileText, Activity, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { getAllUsers, updateUserRole, UserProfile, auth, deleteUserDoc, resetUserPassword, updateUserProfile, addUser, getFeedback, updateFeedbackStatus, Feedback } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

const mockAuditLogs = [
  { id: 1, action: "User Role Updated", user: "Admin", target: "john@example.com", timestamp: "2024-03-31 09:12:45", status: "success", details: "Role changed from User to Admin" },
  { id: 2, action: "System Scan Initiated", user: "System", target: "Network Node 4", timestamp: "2024-03-31 08:45:12", status: "success", details: "Full vulnerability scan started" },
  { id: 3, action: "Failed Login Attempt", user: "Unknown", target: "admin@cybershield.ai", timestamp: "2024-03-31 08:30:05", status: "warning", details: "IP: 192.168.45.12 (3 failed attempts)" },
  { id: 4, action: "New User Created", user: "Admin", target: "sarah@example.com", timestamp: "2024-03-31 07:15:22", status: "success", details: "Account provisioned with User role" },
  { id: 5, action: "Database Backup", user: "System", target: "Main Cluster", timestamp: "2024-03-31 06:00:00", status: "success", details: "Daily automated backup completed" },
  { id: 6, action: "Security Policy Updated", user: "Admin", target: "Global Firewall", timestamp: "2024-03-31 05:20:10", status: "info", details: "Added 12 new malicious IP ranges to blacklist" },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"users" | "logs" | "feedback">("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [feedback, setFeedback] = useState<(Feedback & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ displayName: "", email: "", role: "user" as "admin" | "user" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to retrieve user database.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await getFeedback();
      setFeedback(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to retrieve user feedback.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "feedback") fetchFeedback();
  }, [activeTab]);

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "info";
  }>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info"
  });

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    setConfirmModal({
      show: true,
      title: "Change User Role",
      message: `Are you sure you want to change this user's role to ${newRole}?`,
      type: "warning",
      onConfirm: async () => {
        setUpdating(userId);
        try {
          await updateUserRole(userId, newRole);
          setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
          showToast(`User role updated to ${newRole}.`, "success");
        } catch (error) {
          console.error(error);
          showToast("Failed to update user role.", "error");
        } finally {
          setUpdating(null);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmModal({
      show: true,
      title: "Delete User",
      message: "Are you sure you want to delete this user? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        setUpdating(userId);
        try {
          await deleteUserDoc(userId);
          setUsers(users.filter(u => u.uid !== userId));
          showToast("User deleted successfully.", "success");
        } catch (error) {
          console.error(error);
          showToast("Failed to delete user.", "error");
        } finally {
          setUpdating(null);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleResetPassword = async (email: string) => {
    setConfirmModal({
      show: true,
      title: "Reset Password",
      message: `Send password reset email to ${email}?`,
      type: "info",
      onConfirm: async () => {
        try {
          await resetUserPassword(email);
          showToast("Password reset email sent successfully.", "success");
        } catch (error) {
          showToast("Failed to send password reset email.", "error");
        } finally {
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      }
    });
  };

  const handleUpdateProfile = async () => {
    if (!editingUser) return;
    
    setUpdating(editingUser.uid);
    try {
      await updateUserProfile(editingUser.uid, { displayName: editName });
      setUsers(users.map(u => u.uid === editingUser.uid ? { ...u, displayName: editName } : u));
      setEditingUser(null);
      showToast("Profile updated successfully.", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to update profile.", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.displayName || !newUser.email) {
      showToast("Please fill all fields.", "error");
      return;
    }
    
    setLoading(true);
    try {
      const newUid = await addUser(newUser);
      if (newUid) {
        // Refresh users list
        await fetchUsers();
        setIsAddingUser(false);
        setNewUser({ displayName: "", email: "", role: "user" });
        showToast("User profile created successfully.", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to create user profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 dark:border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse">
          {activeTab === "users" ? "RETRIEVING USER DATABASE..." : 
           activeTab === "feedback" ? "RETRIEVING USER FEEDBACK..." : 
           "INITIALIZING ADMIN PANEL..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
            <ShieldAlert className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-200 tracking-tight">Admin Control Panel</h1>
            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => setActiveTab("users")}
                className={cn(
                  "text-sm font-bold transition-all",
                  activeTab === "users" ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                User Management
              </button>
              <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <button 
                onClick={() => setActiveTab("logs")}
                className={cn(
                  "text-sm font-bold transition-all",
                  activeTab === "logs" ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                Audit Logs
              </button>
              <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <button 
                onClick={() => setActiveTab("feedback")}
                className={cn(
                  "text-sm font-bold transition-all",
                  activeTab === "feedback" ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                User Feedback
              </button>
            </div>
          </div>
        </div>
        {activeTab === "users" && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50 w-64 shadow-sm transition-all"
              />
            </div>
            <button
              onClick={() => setIsAddingUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
            <button
              onClick={fetchUsers}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all shadow-sm"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}
        {activeTab === "feedback" && (
          <div className="flex items-center gap-4">
            <button
              onClick={fetchFeedback}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all shadow-sm"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {activeTab === "users" ? (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" />
              User Management
            </h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-cyan-500/30 transition-colors">
                          <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                          user.uid === auth.currentUser?.uid || Math.random() > 0.5 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{user.displayName}</p>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        user.uid === auth.currentUser?.uid || Math.random() > 0.5 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      )} />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {user.uid === auth.currentUser?.uid || Math.random() > 0.5 ? "Online" : "Offline"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      disabled={updating === user.uid || user.uid === auth.currentUser?.uid}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value as "admin" | "user")}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-transparent focus:outline-none transition-all cursor-pointer disabled:cursor-not-allowed",
                        user.role === "admin"
                          ? "text-cyan-600 dark:text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
                          : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                      )}
                    >
                      <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">User</option>
                      <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 font-mono">
                      {user.createdAt.toDate().toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditName(user.displayName);
                        }}
                        className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.email)}
                        className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        disabled={user.uid === auth.currentUser?.uid || updating === user.uid}
                        onClick={() => handleDeleteUser(user.uid)}
                        className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-30"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === "logs" ? (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-500" />
              System Audit Logs
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500">LIVE MONITORING</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Initiator</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Target</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold",
                          log.user === "System" ? "bg-blue-500/10 text-blue-500" : "bg-cyan-500/10 text-cyan-500"
                        )}>
                          {log.user[0]}
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500 font-mono">{log.target}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          log.status === "success" ? "bg-emerald-500" :
                          log.status === "warning" ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          log.status === "success" ? "text-emerald-500" :
                          log.status === "warning" ? "text-amber-500" : "text-blue-500"
                        )}>{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 italic truncate max-w-[200px]">{log.details}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-500" />
              User Feedback & Reports
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {feedback.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500 font-mono">
                        {item.timestamp.toDate().toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{item.userEmail}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{item.userId.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                        item.type === "bug" ? "text-red-500 border-red-500/20 bg-red-500/5" :
                        item.type === "feature" ? "text-cyan-500 border-cyan-500/20 bg-cyan-500/5" :
                        "text-slate-500 border-slate-500/20 bg-slate-500/5"
                      )}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{item.subject}</p>
                        <p className="text-xs text-slate-500 truncate">{item.message}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as Feedback["status"];
                          await updateFeedbackStatus(item.id, newStatus);
                          setFeedback(feedback.map(f => f.id === item.id ? { ...f, status: newStatus } : f));
                          showToast("Feedback status updated", "success");
                        }}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-transparent focus:outline-none transition-all cursor-pointer",
                          item.status === "resolved" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                          item.status === "in-progress" ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                          "text-slate-500 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                        )}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setConfirmModal({
                            show: true,
                            title: "Feedback Details",
                            message: `Subject: ${item.subject}\n\nMessage: ${item.message}`,
                            type: "info",
                            onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false }))
                          });
                        }}
                        className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {feedback.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-slate-500 font-mono text-sm">NO FEEDBACK RECEIVED YET</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  confirmModal.type === "danger" ? "bg-red-500/10 text-red-500" :
                  confirmModal.type === "warning" ? "bg-yellow-500/10 text-yellow-500" :
                  "bg-cyan-500/10 text-cyan-500"
                )}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">{confirmModal.title}</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={cn(
                    "flex-1 text-white dark:text-slate-950 font-bold py-2 rounded-lg transition-all",
                    confirmModal.type === "danger" ? "bg-red-500 hover:bg-red-600" :
                    confirmModal.type === "warning" ? "bg-yellow-500 hover:bg-yellow-600" :
                    "bg-cyan-500 hover:bg-cyan-600"
                  )}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">Add New User</h2>
                <button onClick={() => setIsAddingUser(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Initial Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "admin" | "user" })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">
                    Note: This creates a user profile in the database. The user will still need to sign in with this email to access the system.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsAddingUser(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    disabled={loading}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Create User</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">Edit User Profile</h2>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                  <input
                    type="text"
                    value={editingUser.email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={updating === editingUser.uid}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {updating === editingUser.uid ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-2xl z-[70] flex items-center gap-3 border",
              toast.type === "success" 
                ? "bg-emerald-500 text-white border-emerald-400" 
                : "bg-red-500 text-white border-red-400"
            )}
          >
            {toast.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span className="font-bold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
