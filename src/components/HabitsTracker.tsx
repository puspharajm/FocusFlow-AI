import React, { useState } from "react";
import { Plus, Flame, Sparkles, Trophy, CheckCircle2, ChevronRight, Award } from "lucide-react";
import { Habit } from "../types";

interface HabitsTrackerProps {
  habits: Habit[];
  onHabitsChange: (habits: Habit[]) => void;
  onXpEarned: (amount: number) => void;
}

export default function HabitsTracker({ habits, onHabitsChange, onXpEarned }: HabitsTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [category, setCategory] = useState<"work" | "health" | "minimalism" | "focus">("focus");
  const [targetCount, setTargetCount] = useState(5);

  // Generate date strings for the past 5 days to render logger grid
  const getPastDates = () => {
    const dates = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        iso: d.toISOString().split("T")[0],
        label: d.toLocaleDateString([], { weekday: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const datesLog = getPastDates();

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newHabit: Habit = {
      id: "habit-" + Date.now(),
      name: newName.trim(),
      category: category as any,
      streak: 0,
      logs: [],
      targetCount: targetCount
    };

    onHabitsChange([newHabit, ...habits]);
    onXpEarned(40);
    setNewName("");
    setShowAddForm(false);
  };

  // Toggle log on a specific date string
  const handleToggleLog = (habitId: string, dateStr: string) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        const index = h.logs.indexOf(dateStr);
        let nextLogs = [...h.logs];
        let nextStreak = h.streak;

        if (index > -1) {
          nextLogs.splice(index, 1);
          nextStreak = Math.max(0, nextStreak - 1);
        } else {
          nextLogs.push(dateStr);
          nextStreak += 1;
          onXpEarned(50); // Rewarding +50 XP for daily consistency loops!
        }

        return {
          ...h,
          logs: nextLogs,
          streak: nextStreak
        };
      }
      return h;
    });

    onHabitsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Habit Architecture Engine</h2>
          <p className="text-xs text-slate-400">Lock in consistent attention patterns. Complete consecutive checkmarks to lock continuous streaks.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-slate-900 border hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Inject New Habit
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddHabit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm max-w-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Configure Habit Pattern</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Habit Label</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. 15 Min Eyes-closed Silence"
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Pattern Goal Group</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
                >
                  <option value="focus">Attention Tuning</option>
                  <option value="health">Mind & Body</option>
                  <option value="work">SaaS Coding Log</option>
                  <option value="minimalism">Recovery & Rest</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Times per Week</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-brand-primary text-white text-xs font-mono font-bold rounded-lg cursor-pointer"
            >
              Confirm Pattern (+40 XP)
            </button>
          </div>
        </form>
      )}

      {/* Grid of habits list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Habit Cards */}
        {habits.map((h) => (
          <div key={h.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-4">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-brand-warning">
                  {h.category}
                </span>

                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                  <Flame className="w-4 h-4 text-brand-primary" />
                  <span>Streak: {h.streak} Days</span>
                </div>
              </div>

              <h4 className="font-semibold text-sm text-slate-900 leading-tight">{h.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono">Target benchmark: {h.targetCount} instances / week</p>
            </div>

            {/* Past logged dates triggers row */}
            <div className="border-t border-slate-100 pt-3">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Past 5 Days Logger Slots
              </span>

              <div className="grid grid-cols-5 gap-2 text-center">
                {datesLog.map((date) => {
                  const logged = h.logs.includes(date.iso);
                  return (
                    <button
                      key={date.iso}
                      type="button"
                      onClick={() => handleToggleLog(h.id, date.iso)}
                      className={`py-2 rounded-xl text-[10px] font-mono flex flex-col items-center justify-center transition-all cursor-pointer ${
                        logged
                          ? "bg-slate-900 border-2 border-brand-primary text-white font-bold shadow-md"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      <span>{date.label.split(" ")[0]}</span>
                      <span className="text-[9px] mt-0.5">{date.label.split(" ")[1]}</span>
                      {logged ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-secondary mt-1 shrink-0" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Achievement level */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 bg-slate-50 p-2 rounded-xl">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Yield Ratio: {Math.round((h.logs.length / 5) * 100)}% compliance logged</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
