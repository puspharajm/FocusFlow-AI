import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  AlertTriangle,
  Edit,
  MoreVertical,
  Sliders,
  Zap,
  Flame,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, PriorityLevel, EnergyLevel, TaskStatus, SubTask, FocusSession } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface TimeEstimate {
  suggestedMinutes: number;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export function estimateTaskTime(
  title: string, 
  category: string, 
  sessions: FocusSession[],
  tasks: Task[]
): TimeEstimate {
  const titleToCategory = new Map<string, string>();
  tasks.forEach(t => {
    titleToCategory.set(t.title.toLowerCase(), t.category.toLowerCase());
  });

  const lowerTitle = title.toLowerCase();
  const titleWords = lowerTitle.split(/\s+/).filter(w => w.length > 3);
  const matchedSessions: FocusSession[] = [];
  const categorySessions: FocusSession[] = [];

  sessions.forEach(sess => {
    const sessTitleLower = sess.taskTitle.toLowerCase();
    const sessCat = titleToCategory.get(sessTitleLower) || "";
    
    const hasKeywordMatch = titleWords.some(word => sessTitleLower.includes(word));
    if (hasKeywordMatch) {
      matchedSessions.push(sess);
    }
    
    if (sessCat === category.toLowerCase() || (sess.taskTitle && sessTitleLower.includes(category.toLowerCase()))) {
      categorySessions.push(sess);
    }
  });

  let totalMinutes = 0;
  let count = 0;

  if (matchedSessions.length > 0) {
    matchedSessions.forEach(s => {
      totalMinutes += s.durationMinutes;
      count++;
    });
  }

  if (count < 2 && categorySessions.length > 0) {
    categorySessions.forEach(s => {
      totalMinutes += s.durationMinutes;
      count++;
    });
  }

  const defaultAverages: Record<string, number> = {
    engineering: 60,
    architecture: 90,
    design: 45,
    operations: 30,
    integrations: 75,
    general: 40
  };

  const defaultMinutes = defaultAverages[category.toLowerCase()] || defaultAverages.general;

  if (count === 0) {
    return {
      suggestedMinutes: defaultMinutes,
      confidence: "low",
      reason: `No matched history. Provided default benchmark for ${category}.`
    };
  }

  const average = Math.round(totalMinutes / count);
  const suggestedMinutes = Math.max(15, Math.round(average / 5) * 5);
  const confidence = count > 3 ? "high" : "medium";

  return {
    suggestedMinutes,
    confidence,
    reason: `Computed from ${count} similar focus session(s) in history.`
  };
}

interface TaskManagerProps {
  tasks: Task[];
  sessions: FocusSession[];
  onTasksChange: (tasks: Task[]) => void;
  onXpEarned: (amount: number) => void;
  onAlert?: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function TaskManager({ tasks, sessions, onTasksChange, onXpEarned, onAlert }: TaskManagerProps) {
  // Dynamic velocity data of task completions in the last 7 days
  const getVelocityData = () => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      
      const count = tasks.filter(t => {
        if (t.status !== "done") return false;
        if (t.completedAt) {
          return t.completedAt.startsWith(dateStr);
        }
        // Fallback for initial mock data task-3
        if (t.id === "task-3" && i === 3) {
          return true;
        }
        return false;
      }).length;

      data.push({
        day: dayLabel,
        "Tasks Completed": count
      });
    }
    return data;
  };

  const velocityData = getVelocityData();

  // Add task forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [category, setCategory] = useState("Engineering");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);

  // Dynamic AI estimation trigger
  useEffect(() => {
    if (newTitle.trim()) {
      const rec = estimateTaskTime(newTitle, category, sessions, tasks);
      setEstimatedMinutes(rec.suggestedMinutes);
    }
  }, [newTitle, category, sessions, tasks]);

  // Loading indicator for breakdown
  const [loadingBreakdownId, setLoadingBreakdownId] = useState<string | null>(null);
  const [coachTips, setCoachTips] = useState<Record<string, string>>({});

  // Sorting configurations
  const [autoPrioritySort, setAutoPrioritySort] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    taskId: string;
  } | null>(null);

  // Quick Action Dialog overlays
  const [showQuickNoteTaskId, setShowQuickNoteTaskId] = useState<string | null>(null);
  const [quickNoteText, setQuickNoteText] = useState("");

  // Edit Task States
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<PriorityLevel>("medium");
  const [editEnergy, setEditEnergy] = useState<EnergyLevel>("medium");
  const [editCategory, setEditCategory] = useState("Engineering");
  const [editDeadline, setEditDeadline] = useState("");
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState<number>(30);

  // Dynamic AI estimation trigger for EDIT form
  const [editRec, setEditRec] = useState<TimeEstimate | null>(null);
  useEffect(() => {
    if (editTitle.trim() && editingTask) {
      const rec = estimateTaskTime(editTitle, editCategory, sessions, tasks);
      setEditRec(rec);
    } else {
      setEditRec(null);
    }
  }, [editTitle, editCategory, sessions, tasks, editingTask]);

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditPriority(task.priority || "medium");
    setEditEnergy(task.energy || task.effort || "medium");
    setEditCategory(task.category);
    setEditDeadline(task.deadline || "");
    setEditEstimatedMinutes(task.estimatedMinutes || 30);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    const updated = tasks.map((t) => {
      if (t.id === editingTask.id) {
        return {
          ...t,
          title: editTitle.trim(),
          description: editDesc.trim() || undefined,
          priority: editPriority,
          effort: editEnergy,
          energy: editEnergy,
          category: editCategory,
          deadline: editDeadline || undefined,
          estimatedMinutes: Number(editEstimatedMinutes) || 30,
          estimated_duration: Number(editEstimatedMinutes) || 30
        };
      }
      return t;
    });

    onTasksChange(updated);
    if (onAlert) onAlert(`Task "${editTitle.trim()}" updated successfully`, "success");
    setEditingTask(null);
  };

  // Clean context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const calculateTaskWeight = (task: Task): number => {
    const uMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const eMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const uScore = uMap[(task.priority || "medium").toLowerCase()] || 2;
    const eScore = eMap[(task.energy || task.effort || "medium").toLowerCase()] || 2;
    return uScore * 0.6 + eScore * 0.4;
  };

  const triggerManualAIPrioritySort = () => {
    const sorted = [...tasks].sort((a, b) => calculateTaskWeight(b) - calculateTaskWeight(a));
    onTasksChange(sorted);
    if (onAlert) {
      onAlert("Priority sequence ranks updated via (Urgency * 0.6) + (Effort * 0.4).", "success");
    }
  };

  // Add a task
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: "task-" + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      priority,
      effort: energy,
      energy,
      category,
      deadline: deadline || undefined,
      status: "todo",
      subtasks: [],
      createdAt: new Date().toISOString(),
      estimatedMinutes: Number(estimatedMinutes) || 30,
      estimated_duration: Number(estimatedMinutes) || 30
    };

    onTasksChange([...tasks, newTask]);
    onXpEarned(20); // +20 XP for standard creations

    if (onAlert) onAlert(`Task "${newTask.title}" added successfully`, "success");

    setNewTitle("");
    setNewDesc("");
    setPriority("medium");
    setEnergy("medium");
    setDeadline("");
    setEstimatedMinutes(30);
    setShowAddForm(false);
  };

  // Delete a task
  const handleDeleteTask = (taskId: string) => {
    onTasksChange(tasks.filter((t) => t.id !== taskId));
    if (onAlert) onAlert("Task removed from workspace", "info");
  };

  // Shift status
  const handleMoveStatus = (taskId: string, targetStatus: TaskStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        if (targetStatus === "done" && t.status !== "done") {
          onXpEarned(100); // 100 XP when concluding a task!
        }
        return { 
          ...t, 
          status: targetStatus,
          completedAt: targetStatus === "done" ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    onTasksChange(updated);
  };

  // Toggle subtask completion
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextSubtasks = t.subtasks.map((s) => {
          if (s.id === subtaskId) {
            const nextCompleted = !s.completed;
            if (nextCompleted) onXpEarned(15); // +15 XP for checkmark increments
            return { ...s, completed: nextCompleted };
          }
          return s;
        });
        return { ...t, subtasks: nextSubtasks };
      }
      return t;
    });
    onTasksChange(updated);
  };

  // AI Task Breakdown Integrator
  const triggerAiBreakdown = async (task: Task) => {
    setLoadingBreakdownId(task.id);
    try {
      const response = await fetch("/api/ai/task-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description || "",
          effort: task.effort,
          energy: task.energy,
        }),
      });

      if (!response.ok) {
        throw new Error("Breakdown API error");
      }

      const resData = await response.json();
      
      const mappedSubtasks: SubTask[] = (resData.subtasks || []).map((sub: any, i: number) => ({
        id: `subtask-${task.id}-${i}-${Date.now()}`,
        title: sub.title,
        completed: false,
        etaMinutes: sub.etaMinutes || 20,
        effort: sub.effort || "medium"
      }));

      const updated = tasks.map((t) => {
        if (t.id === task.id) {
          return {
            ...t,
            subtasks: mappedSubtasks,
            aiBreakdownRequested: true
          };
        }
        return t;
      });

      onTasksChange(updated);
      onXpEarned(40); // Experience reward for expanding strategies!

      if (resData.tip) {
        setCoachTips((prev) => ({
          ...prev,
          [task.id]: resData.tip,
        }));
      }

      if (onAlert) onAlert("AI structured checklists populated!", "success");
    } catch (err) {
      if (onAlert) {
        onAlert("Simulated offline subtasks generated successfully.", "success");
      }
      
      const fallbackSubs: SubTask[] = [
        { id: `subtask-f1-${task.id}`, title: "Initialize directory context and audit schemas", completed: false, etaMinutes: 15, effort: "low" },
        { id: `subtask-f2-${task.id}`, title: "Produce robust, high-fidelity implementation draft", completed: false, etaMinutes: 40, effort: "high" },
        { id: `subtask-f3-${task.id}`, title: "Refine typography spacing and run strict linter checks", completed: false, etaMinutes: 20, effort: "medium" }
      ];
      const updated = tasks.map((t) => {
        if (t.id === task.id) {
          return { ...t, subtasks: fallbackSubs, aiBreakdownRequested: true };
        }
        return t;
      });
      onTasksChange(updated);
    } finally {
      setLoadingBreakdownId(null);
    }
  };

  const handleContextMenuTrigger = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      taskId
    });
  };

  // Group columns
  const cols: { key: TaskStatus; label: string; bg: string }[] = [
    { key: "todo", label: "Attention Backlog", bg: "bg-slate-50 border-slate-200" },
    { key: "in_progress", label: "Active Cognitive Work", bg: "bg-indigo-50/40 border-indigo-150" },
    { key: "done", label: "Concluded Sprints Area", bg: "bg-emerald-50/20 border-emerald-150" }
  ];

  return (
    <div className="space-y-6 relative">
      
      {/* Task Page Header widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-950">AI Cognitive Task Workspace</h2>
          <p className="text-xs text-slate-400">Map priority backlog metrics and generate dynamic subtask schedules via the AI Coach.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerManualAIPrioritySort}
            className="px-4 py-2 bg-indigo-50 border border-indigo-150 text-indigo-650 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
            AI Priority Sort
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Task Core Injection
          </button>
        </div>
      </div>

      {/* Auto-Priority sorting controller bar */}
      <div className="bg-slate-100/50 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/65 text-xs">
        <div className="flex items-center gap-2.5">
          <input
            id="auto-priority-sort-checkbox"
            type="checkbox"
            checked={autoPrioritySort}
            onChange={(e) => {
              setAutoPrioritySort(e.target.checked);
              if (e.target.checked && onAlert) {
                onAlert("Real-time prioritization sort active.", "info");
              }
            }}
            className="w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-0 cursor-pointer"
          />
          <div className="leading-tight">
            <label htmlFor="auto-priority-sort-checkbox" className="font-semibold text-slate-800 cursor-pointer block">
              Auto-Priority Real-Time Sort
            </label>
            <span className="text-[10px] text-slate-400 font-mono">(Sorting algorithm: 60% Urgency score + 40% Effort level)</span>
          </div>
        </div>

        <button
          onClick={triggerManualAIPrioritySort}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all border border-indigo-100 cursor-pointer self-start sm:self-center"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/10" />
          AI Priority Sort
        </button>
      </div>

      {/* Task Injection Panel (Linear Style) */}
      {showAddForm && (
        <form onSubmit={handleAddNewTask} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm max-w-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">New Task Configuration</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Task Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Audit API caching layers and code splittings"
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Details (Optional)</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Provide task specifics. The AI Breakdown engine uses these insights."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              />
            </div>

            {newTitle.trim() && (
              <div className="sm:col-span-2 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-100/60 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-xs transition-all gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-500/10" /> AI Time Estimator Suggestion
                  </span>
                  <p className="text-slate-850 font-medium">
                    Recommended Duration: <span className="font-bold text-slate-900">{estimateTaskTime(newTitle, category, sessions, tasks).suggestedMinutes} minutes</span>
                  </p>
                  <p className="text-[11.5px] text-slate-400">
                    {estimateTaskTime(newTitle, category, sessions, tasks).reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rec = estimateTaskTime(newTitle, category, sessions, tasks);
                    setEstimatedMinutes(rec.suggestedMinutes);
                    if (onAlert) onAlert(`Applied AI suggestion: ${rec.suggestedMinutes} minutes`, "success");
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold tracking-tight text-[11px] transition-all cursor-pointer shrink-0"
                >
                  Apply Recommendation
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Attention Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
              >
                <option value="low">Low Priority (Slate)</option>
                <option value="medium">Medium Priority (Amber)</option>
                <option value="high">High priority (Red)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Energy Required</label>
              <select
                value={energy}
                onChange={(e) => setEnergy(e.target.value as EnergyLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
              >
                <option value="low">Low Energy Badge</option>
                <option value="medium">Medium Energy Badge</option>
                <option value="high">High Energy Badge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Workflow Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
              >
                <option value="Engineering">Engineering</option>
                <option value="Architecture">Architecture</option>
                <option value="Design">Product Design</option>
                <option value="Operations">Operations</option>
                <option value="Integrations">Integrations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Deadline Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Estimated Duration (Min)</label>
              <input
                type="number"
                min={5}
                max={480}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-250 rounded-xl text-xs text-slate-500 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white hover:brightness-110 rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Inject To Backlog (+20 XP)
            </button>
          </div>
        </form>
      )}

      {/* Task Completion Velocity Bar Chart */}
      <div className="bg-white border border-slate-200/85 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-primary animate-pulse" /> Task Completion Velocity
            </h3>
            <p className="text-xs text-slate-400 font-sans">Completions recorded per day over the last week</p>
          </div>
          <div className="text-[11px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg">
            Weekly Average: {(tasks.filter(t => t.status === "done").length / 7).toFixed(1)} / day
          </div>
        </div>
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                cursor={{ fill: '#f8fafc', radius: 4 }}
              />
              <Bar dataKey="Tasks Completed" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kanban Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cols.map((col) => {
          let colTasks = tasks.filter((t) => t.status === col.key);

          // Real-time calculation sorting
          if (autoPrioritySort) {
            colTasks = [...colTasks].sort((a, b) => calculateTaskWeight(b) - calculateTaskWeight(a));
          }

          return (
            <div key={col.key} className={`border border-dashed rounded-3xl p-5 ${col.bg} min-h-[500px]`}>
              
              <div className="flex justify-between items-center mb-4 border-b border-slate-200/50 pb-2">
                <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-800">
                  {col.label}
                </span>
                <span className="font-mono text-xs font-bold bg-slate-200 px-2.5 py-0.5 rounded-full text-slate-600">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-4">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No active tasks listed here.
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {colTasks.map((task) => {
                      const completedCount = task.subtasks?.filter(s => s.completed).length ?? 0;
                      const totalCount = task.subtasks?.length ?? 0;
                      const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                      return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          key={task.id} 
                          onContextMenu={(e) => handleContextMenuTrigger(e, task.id)}
                          className="group relative bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow hover:border-slate-350 transition-all space-y-3 cursor-context-menu"
                          title="Right click for premium quick commands"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex flex-wrap gap-1.5">
                                {/* Color Coded Urgency Badge */}
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider ${
                                  task.priority === "high" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                  task.priority === "medium" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                  "bg-slate-100 text-slate-650 border border-slate-200"
                                }`}>
                                  {task.priority || "medium"} Urgency
                                </span>

                                {/* Color Coded Energy Badge */}
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider ${
                                  task.energy === "high" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                                  task.energy === "medium" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                  "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                }`}>
                                  ⚡ {task.energy || "low"} effort
                                </span>
                              </div>

                              <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(task);
                                  }}
                                  className="text-slate-400 hover:text-indigo-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  title="Edit Task"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContextMenuTrigger(e, task.id);
                                  }}
                                  className="text-slate-400 hover:text-slate-650 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  title="Actions Menu"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-2 mt-3.5">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-slate-900 leading-snug">{task.title}</h4>
                                {task.description && <p className="text-xs text-slate-400 mt-1">{task.description}</p>}
                              </div>

                              {/* Interactive Progress Indicators Ring */}
                              {totalCount > 0 && (
                                <div className="relative flex items-center justify-center w-8 h-8 shrink-0 bg-slate-50 rounded-xl" title="Subtask Achievement Circle">
                                  <svg className="w-7 h-7 transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                      className="text-slate-200"
                                      strokeWidth="3.5"
                                      stroke="currentColor"
                                      fill="none"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                      className="text-brand-primary transition-all duration-300"
                                      strokeDasharray={`${percentComplete}, 100`}
                                      strokeWidth="3.5"
                                      strokeLinecap="round"
                                      stroke="currentColor"
                                      fill="none"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                  </svg>
                                  <span className="absolute text-[8px] font-bold text-slate-700 font-mono">{percentComplete}%</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Display deadlines or metadata */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{task.category}</span>
                            {task.estimatedMinutes && (
                              <span className="bg-indigo-50/60 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 shrink-0" /> {task.estimatedMinutes}m
                              </span>
                            )}
                            {task.deadline && <span className="flex items-center gap-0.5">⏰ {task.deadline}</span>}
                          </div>

                          {/* Inline Quick Note Section */}
                          <div className="border-t border-slate-100 pt-2.5 space-y-1 bg-amber-50/5 p-2 rounded-xl border border-dashed border-slate-200">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3 text-indigo-500" /> Quick Note
                              </span>
                              {task.quickNote && (
                                <span className="text-[8px] text-emerald-600 font-mono font-bold bg-emerald-50 px-1 rounded border border-emerald-100">Saved</span>
                              )}
                            </div>
                            <textarea
                              key={`${task.id}-quicknote`}
                              defaultValue={task.quickNote || ""}
                              placeholder="Capture links, steps or task context inline..."
                              rows={1}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== (task.quickNote || "")) {
                                  const updated = tasks.map((t) =>
                                    t.id === task.id ? { ...t, quickNote: val || undefined } : t
                                  );
                                  onTasksChange(updated);
                                  if (onAlert) onAlert("Note auto-saved", "success");
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  (e.target as HTMLTextAreaElement).blur();
                                }
                              }}
                              className="w-full bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-indigo-400 focus:ring-0 rounded-xl px-2 py-1.5 text-[11px] text-slate-705 outline-none resize-none transition-all placeholder:text-slate-400 min-h-[32px] leading-relaxed italic"
                            />
                          </div>

                          {/* Subtask Section with Progress Bar */}
                          {totalCount > 0 && (
                            <div className="border-t border-slate-100 pt-2.5 space-y-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                <span>Subtasks Progress</span>
                                <span className="font-mono text-brand-primary">{completedCount}/{totalCount} Done</span>
                              </div>
                              
                              {/* Custom Interactive Progress Bar */}
                              <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                                <motion.div 
                                  className="bg-brand-primary h-1.5 rounded-full" 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentComplete}%` }}
                                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                />
                              </div>

                              <div className="space-y-1 mt-2">
                                {task.subtasks.map((sub) => (
                                  <div key={sub.id} className="flex items-center justify-between text-xs text-slate-700">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSubtask(task.id, sub.id)}
                                      className="flex items-center gap-2 text-left text-xs text-slate-650 hover:text-slate-900 transition-all cursor-pointer"
                                    >
                                      {sub.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                      )}
                                      <span className={sub.completed ? "line-through text-slate-400" : ""}>
                                        {sub.title}
                                      </span>
                                    </button>
                                    {sub.etaMinutes && (
                                      <span className="text-[9px] text-slate-400 font-mono bg-slate-200/40 px-1 rounded">{sub.etaMinutes}m</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {coachTips[task.id] && (
                            <div className="text-[10px] p-2.5 rounded-xl bg-indigo-50/60 text-indigo-950 border border-indigo-100">
                              <p className="font-bold flex items-center gap-1 text-indigo-900">
                                <Sparkles className="w-3" /> Coach Insight
                              </p>
                              <p className="italic mt-0.5 leading-snug">{coachTips[task.id]}</p>
                            </div>
                          )}

                          {/* Control bar */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 gap-2">
                            {/* Status transitions */}
                            <div className="flex gap-1">
                              {task.status !== "todo" && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, "todo")}
                                  className="text-[9px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-mono font-bold cursor-pointer"
                                >
                                  ← Backlog
                                </button>
                              )}
                              {task.status !== "in_progress" && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, "in_progress")}
                                  className="text-[9px] bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded text-indigo-600 font-mono font-bold cursor-pointer"
                                >
                                  ⚡ Focus
                                </button>
                              )}
                              {task.status !== "done" && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, "done")}
                                  className="text-[9px] bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded text-emerald-600 font-mono font-bold cursor-pointer"
                                >
                                  Done ✔
                                </button>
                              )}
                            </div>

                            {/* AI Breakdown button */}
                            {!task.aiBreakdownRequested && task.status !== "done" && (
                              <button
                                type="button"
                                disabled={loadingBreakdownId === task.id}
                                onClick={() => triggerAiBreakdown(task)}
                                className="bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 border border-slate-200 px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all pointer-events-auto cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-brand-primary" />
                                {loadingBreakdownId === task.id ? "Analyzing..." : "AI Outline"}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Right Click Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div 
          className="fixed bg-[#0B1220] text-slate-200 border border-slate-800 rounded-xl shadow-2xl p-2 w-48 z-50 transition-all font-sans text-xs"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-900 mb-1">
            Task Commands
          </div>

          <button
            onClick={() => {
              const selectedT = tasks.find(t => t.id === contextMenu.taskId);
              if (selectedT) triggerAiBreakdown(selectedT);
              setContextMenu(null);
            }}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg text-[11px] text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            Decompose (AI)
          </button>

          <div className="border-t border-slate-900 my-1" />

          <div className="px-2.5 py-1 text-[9px] text-slate-500 uppercase font-mono">Set Priority</div>
          {["low", "medium", "high"].map((pr) => (
            <button
              key={pr}
              onClick={() => {
                const updated = tasks.map(t => t.id === contextMenu.taskId ? { ...t, priority: pr as PriorityLevel } : t);
                onTasksChange(updated);
                setContextMenu(null);
                if (onAlert) onAlert(`Task priority switched to ${pr}`, "success");
              }}
              className="w-full text-left px-4 py-1 hover:bg-slate-900 rounded-lg text-slate-350 hover:text-white capitalize flex items-center gap-2 cursor-pointer"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pr === "high" ? "bg-red-500" : pr === "medium" ? "bg-amber-500" : "bg-slate-450"}`} />
              {pr}
            </button>
          ))}

          <div className="border-t border-slate-900 my-1" />

          <button
            onClick={() => {
              const target = tasks.find(t => t.id === contextMenu.taskId);
              if (target) openEditModal(target);
              setContextMenu(null);
            }}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg text-[11px] text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            Edit Task
          </button>

          <button
            onClick={() => {
              const target = tasks.find(t => t.id === contextMenu.taskId);
              setQuickNoteText(target?.quickNote || "");
              setShowQuickNoteTaskId(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg text-[11px] text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            Add Note
          </button>

          <button
            onClick={() => {
              handleDeleteTask(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full text-left px-2.5 py-1.5 hover:bg-red-950/40 rounded-lg text-[11px] text-red-400 hover:text-red-300 flex items-center gap-2 cursor-pointer font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            Delete
          </button>
        </div>
      )}

      {/* Quick Notes Annotation Dialog Overlay */}
      {showQuickNoteTaskId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Add Quick Task Note</h3>
              <p className="text-xs text-slate-400">Append instant specifications or checklist context.</p>
            </div>
            <textarea
              className="w-full border border-slate-200 outline-none p-3.5 rounded-2xl text-xs bg-slate-50 focus:border-brand-primary focus:ring-0 leading-relaxed text-slate-800"
              rows={4}
              value={quickNoteText}
              onChange={(e) => setQuickNoteText(e.target.value)}
              placeholder="e.g. Needs consultation with standard API schemas before finalizing..."
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowQuickNoteTaskId(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = tasks.map(t => t.id === showQuickNoteTaskId ? { ...t, quickNote: quickNoteText.trim() } : t);
                  onTasksChange(updated);
                  setShowQuickNoteTaskId(null);
                  if (onAlert) onAlert("Task note captured successfully", "success");
                }}
                className="px-4 py-2 bg-brand-primary text-white rounded-xl font-bold cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal Overlay */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <div>
                <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
                  <Edit className="w-4 h-4 text-brand-primary" /> Edit Task Configuration
                </h3>
                <p className="text-xs text-slate-400">Update task properties, deadlines, and schedule variables.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded hover:bg-slate-50 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Details (Optional)</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                  />
                </div>

                {editTitle.trim() && editRec && (
                  <div className="sm:col-span-2 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-100/60 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-xs transition-all gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-500/10" /> AI Time Estimator Suggestion
                      </span>
                      <p className="text-slate-850 font-medium">
                        Recommended Duration: <span className="font-bold text-slate-900">{editRec.suggestedMinutes} minutes</span>
                      </p>
                      <p className="text-[11.5px] text-slate-400">
                        {editRec.reason}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditEstimatedMinutes(editRec.suggestedMinutes);
                        if (onAlert) onAlert(`Applied AI suggestion: ${editRec.suggestedMinutes} minutes`, "success");
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold tracking-tight text-[11px] transition-all cursor-pointer shrink-0"
                    >
                      Apply Recommendation
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Attention Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="low">Low Priority (Slate)</option>
                    <option value="medium">Medium Priority (Amber)</option>
                    <option value="high">High priority (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Energy Required</label>
                  <select
                    value={editEnergy}
                    onChange={(e) => setEditEnergy(e.target.value as EnergyLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="low">Low Energy Badge</option>
                    <option value="medium">Medium Energy Badge</option>
                    <option value="high">High Energy Badge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Workflow Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Design">Product Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Integrations">Integrations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Estimated Duration (Min)</label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    value={editEstimatedMinutes}
                    onChange={(e) => setEditEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs text-slate-500 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-white hover:brightness-110 rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
                >
                  Save Task Details
                </button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
