import { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Clock,
  Bot,
  Plus,
  Trophy,
  Users,
  Shield,
  Heart,
  LayoutDashboard,
  Brain,
  Zap,
  Moon,
  Sun,
  Trash,
  Calendar,
  Target,
  Settings,
  Flame,
  LineChart,
  LogOut,
  AppWindow,
  CreditCard,
  Crown,
  Search,
  Menu
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";
import hotkeys from "hotkeys-js";

// Submodules
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import FocusTimer from "./components/FocusTimer";
import TaskManager from "./components/TaskManager";
import AICoach from "./components/AICoach";
import Planner from "./components/Planner";
import HabitsTracker from "./components/HabitsTracker";
import BurnoutDiagnostics from "./components/BurnoutDiagnostics";
import KnowledgeVault from "./components/KnowledgeVault";
import WorkspaceLeagues from "./components/WorkspaceLeagues";
import FocusChallenges from "./components/FocusChallenges";

// Raw datasets
import {
  INITIAL_USER_PROFILE,
  INITIAL_TASKS,
  INITIAL_HABITS,
  INITIAL_GOALS,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_NOTES,
  INITIAL_TEAM_Sprint_INFO,
  INITIAL_CHALLENGES
} from "./data";

import { Task, Habit, Goal, FocusSession, KnowledgeNote, FocusChallenge } from "./types";

export default function App() {
  // Master React Core States
  const [profile, setProfile] = useState(INITIAL_USER_PROFILE);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [sessions, setSessions] = useState<FocusSession[]>(INITIAL_FOCUS_SESSIONS);
  const [notes, setNotes] = useState<KnowledgeNote[]>(INITIAL_NOTES);
  const [challenges, setChallenges] = useState<FocusChallenge[]>(INITIAL_CHALLENGES);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global search search query and theme preferences
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // In-app alert notification and confirm states
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ text: string; onConfirm: () => void } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "warning" = "info") => {
    setToastMessage({ text, type });
    // Keep visible for some time before fade
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // 1. Calculate dynamic consecutive days streak of focus sessions
  const calculateStreak = () => {
    if (!sessions || sessions.length === 0) return 0;
    
    const completedDays = new Set<string>();
    sessions.forEach(s => {
      if (s.timestamp) {
        try {
          const dateStr = s.timestamp.split('T')[0];
          completedDays.add(dateStr);
        } catch (e) {}
      }
    });

    if (completedDays.size === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!completedDays.has(todayStr) && !completedDays.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let currentDate = completedDays.has(todayStr) ? new Date() : yesterday;

    for (let attempts = 0; attempts < 365; attempts++) {
      const checkStr = currentDate.toISOString().split('T')[0];
      if (completedDays.has(checkStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // 2. Register global keyboard shortcuts for professional workflow speed
  useEffect(() => {
    hotkeys("d, t, m, p, v, c, h", (event, handler) => {
      event.preventDefault();
      switch (handler.key) {
        case "d":
          setActiveTab("dashboard");
          showToast("⌨ Navigation: Switched to Control Dashboard", "info");
          break;
        case "t":
          setActiveTab("timer");
          showToast("⌨ Navigation: Switched to Focus Timer", "info");
          break;
        case "m":
          setActiveTab("tasks");
          showToast("⌨ Navigation: Switched to Task Manager BOARD", "info");
          break;
        case "p":
          setActiveTab("planner");
          showToast("⌨ Navigation: Switched to AI Daily Planner", "info");
          break;
        case "v":
          setActiveTab("vault");
          showToast("⌨ Navigation: Switched to Knowledge Vault", "info");
          break;
        case "c":
          setActiveTab("coach");
          showToast("⌨ Navigation: Switched to AI Advisor Chat", "info");
          break;
        case "h":
          setActiveTab("habits");
          showToast("⌨ Navigation: Switched to Habits Tracker", "info");
          break;
      }
    });

    // Support for Ctrl+1, Ctrl+2, etc. as alternative fast navigators
    hotkeys("ctrl+1, ctrl+2, ctrl+3, ctrl+4, ctrl+5", (event, handler) => {
      event.preventDefault();
      switch (handler.key) {
        case "ctrl+1":
          setActiveTab("dashboard");
          break;
        case "ctrl+2":
          setActiveTab("timer");
          break;
        case "ctrl+3":
          setActiveTab("tasks");
          break;
        case "ctrl+4":
          setActiveTab("planner");
          break;
        case "ctrl+5":
          setActiveTab("vault");
          break;
      }
    });

    return () => {
      hotkeys.unbind("d, t, m, p, v, c, h");
      hotkeys.unbind("ctrl+1, ctrl+2, ctrl+3, ctrl+4, ctrl+5");
    };
  }, []);

  // 3. Keep documentElement dark class matched
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Focus Timer Active selected task state mapping
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);

  // Experience level and XP reward aggregator
  const handleEarnXp = (amount: number) => {
    setProfile((prev) => {
      const nextXp = prev.xp + amount;
      const nextLevelLimit = prev.level * 1050;
      if (nextXp >= nextLevelLimit) {
        showToast(`🎓 LEVEL UP ACHIEVED! You scaled to Level ${prev.level + 1}! Deep work calibration threshold expanded.`, "success");
        return {
          ...prev,
          level: prev.level + 1,
          xp: nextXp - nextLevelLimit
        };
      }
      return { ...prev, xp: nextXp };
    });
  };

  // Profile update callbacks
  const handleProfileUpdate = (updates: Partial<typeof INITIAL_USER_PROFILE>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Complete onboarding sequence
  const handleOnboardingComplete = (newProfile: Partial<typeof INITIAL_USER_PROFILE>) => {
    setProfile((prev) => ({
      ...prev,
      ...newProfile,
      onboardingCompleted: true
    }));
    setActiveTab("dashboard");
  };

  // Quick navigation to active workspace
  const handleStartFocusFromDashboard = (taskToFocus: Task | null) => {
    setActiveFocusTask(taskToFocus);
    setActiveTab("timer");
  };

  if (!profile.onboardingCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Filter core datasets based on search queries
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.priority.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} flex flex-col lg:flex-row antialiased`}>
      
      {/* 1. Collapsible Left Nav Sidebar / Control Tower */}
      <aside className={`transition-all duration-300 w-full ${
        sidebarCollapsed ? "lg:w-20" : "lg:w-64"
      } bg-[#0B1220] text-slate-300 flex flex-col justify-between shrink-0 lg:sticky lg:top-0 lg:h-screen border-r border-slate-900 shadow-xl z-20`}>
        
        <div className="p-4 space-y-6">
          {/* Logo Branding / FocusFlow with Hamburger Toggle */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary p-0.5 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                </div>
              </div>
              {!sidebarCollapsed && (
                <div className="animate-fade-in whitespace-nowrap">
                  <span className="font-display text-sm font-bold tracking-tight text-white block">FocusFlow AI</span>
                  <span className="text-[9px] text-brand-secondary font-mono tracking-wider">ATTENTION ENGINE</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              title={sidebarCollapsed ? "Expand Sidebar Workspace" : "Contract Sidebar Workspace"}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* User Status Progression Capsule */}
          <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-1.5 py-1" title={`Level ${profile.level}, ${profile.xp} XP`}>
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-white relative">
                  {profile.level}
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center text-[8px] text-slate-950 font-bold">
                    🔥
                  </span>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white font-semibold">{profile.name}</span>
                  <span className="bg-brand-primary/10 text-brand-primary font-mono text-[9px] px-1.5 py-0.5 rounded border border-brand-primary/20">
                    LVL {profile.level}
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-1.5">
                  <div
                    className="bg-brand-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(profile.xp / (profile.level * 1050)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>XP: {profile.xp}</span>
                  <span>Goal: {profile.level * 1050}</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono mt-1 pt-1.5 border-t border-slate-900/60">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Streak: <strong className="text-white">{currentStreak} Days</strong> focus</span>
                </div>
              </div>
            )}
          </div>

          {/* Primary Navigation groups */}
          <nav className="space-y-4">
            {/* Group 1: Core flow */}
            <div className="space-y-1">
              {sidebarCollapsed ? (
                <div className="border-t border-slate-900 my-2" />
              ) : (
                <span className="text-[10px] font-mono text-slate-500 block px-3 uppercase tracking-wider">DAILY SPACE</span>
              )}
              
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Control Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Control Dashboard</span>}
              </button>

              <button
                onClick={() => setActiveTab("timer")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "timer"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Focus Timer"
              >
                <Clock className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Focus Timer</span>}
              </button>

              <button
                onClick={() => setActiveTab("planner")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "planner"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="AI Daily Planner"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">AI Daily Planner</span>}
              </button>

              <button
                onClick={() => setActiveTab("coach")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "coach"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="AI Advisor Chat"
              >
                <Brain className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">AI Advisor Chat</span>}
              </button>
            </div>

            {/* Group 2: Managers */}
            <div className="space-y-1">
              {sidebarCollapsed ? (
                <div className="border-t border-slate-900 my-2" />
              ) : (
                <span className="text-[10px] font-mono text-slate-500 block px-3 uppercase tracking-wider">MANAGEMENT</span>
              )}
              
              <button
                onClick={() => setActiveTab("tasks")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "tasks"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Task Manager BOARD"
              >
                <Target className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Task Manager BOARD</span>}
              </button>

              <button
                onClick={() => setActiveTab("habits")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "habits"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Habits Tracker"
              >
                <Flame className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Habits Tracker</span>}
              </button>

              <button
                onClick={() => setActiveTab("vault")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "vault"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Knowledge Vault"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Knowledge Vault</span>}
              </button>
            </div>

            {/* Group 3: Diagnostics & Social */}
            <div className="space-y-1">
              {sidebarCollapsed ? (
                <div className="border-t border-slate-900 my-2" />
              ) : (
                <span className="text-[10px] font-mono text-slate-500 block px-3 uppercase tracking-wider">DIAGNOSTICS & TEAMS</span>
              )}

              <button
                onClick={() => setActiveTab("diagnostics")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "diagnostics"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Fatigue Diagnostics"
              >
                <Heart className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Fatigue Diagnostics</span>}
              </button>

              <button
                onClick={() => setActiveTab("workspace")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "workspace"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Team Leagues Feed"
              >
                <Users className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Team Leagues Feed</span>}
              </button>

              <button
                onClick={() => setActiveTab("challenges")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "challenges"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Focus Arena & Brackets"
              >
                <Trophy className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Focus Arena & Brackets</span>}
              </button>

              <button
                onClick={() => setActiveTab("subscriptions")}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-start"
                } gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "subscriptions"
                    ? "bg-gradient-to-r from-brand-primary/20 to-transparent text-white border-l-2 border-brand-primary"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
                title="Premium Licensing"
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">Premium Licensing</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Theme Toggle Button */}
        <div className="px-4 pt-2 border-t border-slate-900/40">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center" : "justify-between"
            } px-3 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all cursor-pointer border border-slate-900/30`}
            title="Toggle theme mode"
          >
            <span className="flex items-center gap-2.5">
              {theme === "light" ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {!sidebarCollapsed && <span className="truncate">Theme Mode</span>}
            </span>
            {!sidebarCollapsed && (
              <span className="text-[8px] font-mono text-slate-500 bg-slate-950/50 px-1 py-0.5 rounded leading-none shrink-0">
                {theme.toUpperCase()}
              </span>
            )}
          </button>
        </div>

        {/* User logout placeholder bar */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/20 text-center flex items-center justify-between">
          {!sidebarCollapsed && <span className="text-[10px] text-slate-500 font-mono">Calibrated in Taipei</span>}
          <button
            onClick={() => {
              setConfirmDialog({
                text: "Restart FocusFlow onboarding? This cleans temporary configs.",
                onConfirm: () => {
                  setProfile((prev) => ({ ...prev, onboardingCompleted: false }));
                }
              });
            }}
            className={`p-1 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-red-500 transition-all cursor-pointer ${
              sidebarCollapsed ? "mx-auto" : ""
            }`}
            title="Reset calibration settings"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* 2. Main Content Frame Workspace */}
      <main className={`flex-1 min-w-0 ${theme === "dark" ? "bg-slate-900 text-slate-100 animate-fade" : "bg-slate-50 text-slate-900"} flex flex-col`}>
        
        {/* Top Header / Clock Ticker panel */}
        <header className={`border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 ${
          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200/60"
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>
              Workspace Operational
            </span>
          </div>

          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks, priorities, or knowledge notes globally..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 ${
                  theme === "dark" ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1.5 h-5 w-5 flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold font-mono text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Global Search dropdown results */}
            {searchQuery && (
              <div className={`absolute top-11 left-0 right-0 border rounded-2xl shadow-xl z-50 p-4 max-h-[360px] overflow-y-auto space-y-4 ${
                theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100 shadow-slate-950/80" : "bg-white border-slate-200 shadow-slate-200/30"
              }`}>
                {/* Section 1: Tasks */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-2">Matching Sprints / Tasks ({filteredTasks.length})</h4>
                  {filteredTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No tasks match search criteria</p>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredTasks.slice(0, 4).map(task => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => {
                            setActiveFocusTask(task);
                            setActiveTab("timer");
                            setSearchQuery("");
                          }}
                          className={`w-full flex items-center justify-between text-left p-2 rounded-xl transition-all ${
                            theme === "dark" ? "hover:bg-slate-900" : "hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <span className={`text-xs font-semibold block line-clamp-1 ${
                              theme === "dark" ? "text-slate-200" : "text-slate-800"
                            }`}>{task.title}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{task.category} • Priority: {task.priority}</span>
                          </div>
                          <span className="text-[9px] bg-brand-primary/10 text-brand-primary font-mono px-1.5 py-0.5 rounded leading-none font-semibold">Focus ⏱</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Notes */}
                <div className={`border-t pt-3 ${theme === "dark" ? "border-slate-850" : "border-slate-100"}`}>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-2">Knowledge Vault Notes ({filteredNotes.length})</h4>
                  {filteredNotes.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No notes match search criteria</p>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredNotes.slice(0, 4).map(note => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => {
                            setActiveTab("vault");
                            setSearchQuery("");
                          }}
                          className={`w-full flex items-center justify-between text-left p-2 rounded-xl transition-all ${
                            theme === "dark" ? "hover:bg-slate-900" : "hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <span className={`text-xs font-semibold block line-clamp-1 ${
                              theme === "dark" ? "text-slate-200" : "text-slate-800"
                            }`}>{note.title}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{note.content}</span>
                          </div>
                          <span className="text-[9px] bg-brand-secondary/20 text-brand-secondary font-mono px-1.5 py-0.5 rounded leading-none font-semibold">View 📖</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current UTC Clock ticker */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-mono leading-none">Global Standard Coordinates</span>
              <span className={`font-mono text-xs font-bold block mt-1 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}>
                2026-06-22 23:14 UTC
              </span>
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-500 border ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
            }`}>
              👨‍💻
            </div>
          </div>
        </header>

        {/* Central Component router */}
        <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="space-y-6"
            >
              {activeTab === "dashboard" && (
            <Dashboard
              profile={profile}
              tasks={tasks}
              goals={goals}
              sessions={sessions}
              onStartFocus={handleStartFocusFromDashboard}
              onNavigate={setActiveTab}
              onGoalsChange={setGoals}
              challenges={challenges}
              currentStreak={currentStreak}
              theme={theme}
            />
          )}

          {activeTab === "timer" && (
            <FocusTimer
              tasks={tasks}
              selectedTask={activeFocusTask}
              onSelectTask={setActiveFocusTask}
              onXpEarned={handleEarnXp}
              onSessionLogged={(s) => setSessions([s, ...sessions])}
              onAlert={(msg, type) => showToast(msg, type || "info")}
            />
          )}

          {activeTab === "tasks" && (
            <TaskManager
              tasks={tasks}
              sessions={sessions}
              onTasksChange={setTasks}
              onXpEarned={handleEarnXp}
              onAlert={(msg, type) => showToast(msg, type || "info")}
            />
          )}

          {activeTab === "planner" && (
            <Planner
              tasks={tasks}
              habits={habits}
              sessions={sessions}
              onAlert={(msg, type) => showToast(msg, type || "warning")}
            />
          )}

          {activeTab === "coach" && (
            <AICoach
              profile={profile}
            />
          )}

          {activeTab === "habits" && (
            <HabitsTracker
              habits={habits}
              onHabitsChange={setHabits}
              onXpEarned={handleEarnXp}
            />
          )}

          {activeTab === "vault" && (
            <KnowledgeVault
              notes={notes}
              onNotesChange={setNotes}
            />
          )}

          {activeTab === "diagnostics" && (
            <BurnoutDiagnostics
              profile={profile}
              sessions={sessions}
              onProfileUpdate={handleProfileUpdate}
              onAlert={(msg, type) => showToast(msg, type || "warning")}
            />
          )}

          {activeTab === "workspace" && (
            <WorkspaceLeagues
              profile={profile}
              teamMembers={INITIAL_TEAM_Sprint_INFO}
            />
          )}

          {activeTab === "challenges" && (
            <FocusChallenges
              challenges={challenges}
              profile={profile}
              onChallengesChange={setChallenges}
              onXpEarned={handleEarnXp}
              onAlert={(msg, type) => showToast(msg, type || "warning")}
            />
          )}

          {activeTab === "subscriptions" && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Premium Licensing Tiers</h2>
                <p className="text-xs text-slate-400">Unlock custom attention calibrations, enterprise dashboard metrics, and infinite AI assistance packages.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Tier 1 */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Standard Timer</span>
                    <h3 className="font-bold text-lg text-slate-900">Free Tier</h3>
                    <p className="text-xs text-slate-400 min-h-[40px]">Perfect for single builders starting visual time management calibrations.</p>
                    <div className="text-xl font-mono font-bold text-slate-900">$0 <span className="text-[10px] font-sans text-slate-400">/ forever</span></div>
                    
                    <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                      <li>• Standard 25/5 focus loops</li>
                      <li>• Manual backlogs listings</li>
                      <li>• Minimal offline caching limits</li>
                    </ul>
                  </div>
                  <button className="w-full py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold mt-6 cursor-pointer">Active Plan</button>
                </div>

                {/* Tier 2 */}
                <div className="bg-white border-2 border-brand-primary rounded-3xl p-6 shadow-md relative flex flex-col justify-between">
                  <div className="absolute -top-3 right-5 bg-brand-primary text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                    ⭐ POPULAR
                  </div>
                  
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-brand-primary uppercase tracking-wider block">Cognitive Pro</span>
                    <h3 className="font-bold text-lg text-slate-900">Developer Coach</h3>
                    <p className="text-xs text-slate-400 min-h-[40px]">Unlock fully calibrated AI schedulers and browser generative ambient synthesizers.</p>
                    <div className="text-xl font-mono font-bold text-slate-900">$8 <span className="text-[10px] font-sans text-slate-400">/ user / mo</span></div>
                    
                    <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                      <li>• Calibrated 38-minute attention blocks</li>
                      <li>• Infinite subtask AI decompositions</li>
                      <li>• Standard Coach chat integrations</li>
                      <li>• Generative sound shield modules</li>
                    </ul>
                  </div>
                  <button className="w-full py-2 bg-brand-primary text-white hover:brightness-110 rounded-xl text-xs font-semibold mt-6 cursor-pointer">Upgrade to Pro</button>
                </div>

                {/* Tier 3 */}
                <div className="bg-gradient-to-b from-[#0B1220] to-[#121E36] border border-slate-800 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-brand-secondary uppercase tracking-wider block">Enterprise Workspace</span>
                    <h3 className="font-bold text-lg text-white">Engineering Teams</h3>
                    <p className="text-xs text-slate-400 min-h-[40px]">Cohesive focus matrices and workload stress monitors designed for companies.</p>
                    <div className="text-xl font-mono font-bold text-white">$15 <span className="text-[10px] font-sans text-slate-400">/ user / mo</span></div>
                    
                    <ul className="text-xs text-slate-400 space-y-2 border-t border-slate-800 pt-3">
                      <li>• Team focus telemetry dashboard</li>
                      <li>• Shared leaderboards & milestones</li>
                      <li>• Cognitive fatigue diagnostics</li>
                      <li>• JIRA and GitHub integration syncs</li>
                    </ul>
                  </div>
                  <button className="w-full py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold mt-6 cursor-pointer">Deploy Team Workspace</button>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* FLOATING SUCCESS/WARNING TOAST OVERLAY */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white border border-slate-800 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-2xl max-w-sm transition-all animate-[bounce_1s_infinite_1]">
          <div className={`p-2.5 rounded-xl text-center flex items-center justify-center ${
            toastMessage.type === "success" ? "bg-emerald-500/10 text-brand-success" : "bg-brand-primary/10 text-brand-primary"
          }`}>
            {toastMessage.type === "success" ? "✔" : "⚡"}
          </div>
          <div className="flex-1 space-y-0.5">
            <h5 className="text-[11px] font-mono font-bold tracking-wide uppercase text-slate-400">Workspace Calibrator</h5>
            <p className="text-xs font-semibold leading-normal text-slate-100">{toastMessage.text}</p>
          </div>
          <button 
            type="button"
            onClick={() => setToastMessage(null)} 
            className="text-slate-500 hover:text-white font-mono text-sm leading-none self-start cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* CONFIRM CALIBRATION OVERLAY MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9998] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative bg-[#0F1626]">
            <h4 className="font-display font-semibold text-lg text-slate-100">Attention Calibration Confirm</h4>
            <p className="text-xs text-slate-400 leading-relaxed my-4">{confirmDialog.text}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:brightness-110 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
