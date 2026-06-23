import { useState } from "react";
import { Sparkles, Clock, Check, Calendar, AlertTriangle, ShieldCheck, RefreshCw, Zap } from "lucide-react";
import { Task, Habit, FocusSession } from "../types";

interface PlannerProps {
  tasks: Task[];
  habits: Habit[];
  sessions?: FocusSession[];
  onAlert: (message: string, type?: "success" | "info" | "warning") => void;
}

interface ScheduleUnit {
  time: string;
  description: string;
  duration: number; // minutes
  type: "focus" | "break" | "habit" | "buffer";
}

export default function Planner({ tasks, habits, sessions = [], onAlert }: PlannerProps) {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleUnit[]>([
    { time: "09:00", description: "Standard Morning Warmup & Backlog Prioritization", duration: 20, type: "buffer" },
    { time: "09:20", description: "Primary Focused Sprint: Task Refactor Authentication", duration: 45, type: "focus" },
    { time: "10:05", description: "Breathing Recovery Exercise Block", duration: 10, type: "break" },
    { time: "10:15", description: "Habit Target: Complete Meditative Breath", duration: 15, type: "habit" },
  ]);
  const [coachAdvice, setCoachAdvice] = useState("Calibrate with the AI Planner in the morning to optimally alternate heavy programming tasks with breathing breaks.");
  const [burnoutRisk, setBurnoutRisk] = useState("Low Risk");

  // Dynamic calculation of Peak Focus Hours from session history
  const getPeakFocusHours = () => {
    if (!sessions || sessions.length === 0) {
      return { start: 10, end: 13, text: "10:00 AM - 1:00 PM" };
    }
    const hourMinutes = Array(24).fill(0);
    sessions.forEach(s => {
      if (!s.timestamp) return;
      try {
        const d = new Date(s.timestamp);
        const h = d.getHours();
        hourMinutes[h] += s.durationMinutes;
      } catch (e) {}
    });

    let maxMinutes = -1;
    let startHour = 10;
    for (let h = 0; h < 24; h++) {
      const total = hourMinutes[h] + hourMinutes[(h + 1) % 24] + hourMinutes[(h + 2) % 24];
      if (total > maxMinutes) {
        maxMinutes = total;
        startHour = h;
      }
    }

    const format12h = (h: number) => {
      const ampm = h >= 12 ? "PM" : "AM";
      const dh = h % 12 === 0 ? 12 : h % 12;
      return `${dh}:00 ${ampm}`;
    };

    return {
      start: startHour,
      end: (startHour + 3) % 24,
      text: `${format12h(startHour)} - ${format12h((startHour + 3) % 24)}`
    };
  };

  const peakPeriod = getPeakFocusHours();

  const isTimeInPeakPeriod = (timeStr: string) => {
    try {
      const hour = parseInt(timeStr.split(":")[0]);
      if (peakPeriod.start < peakPeriod.end) {
        return hour >= peakPeriod.start && hour < peakPeriod.end;
      } else {
        return hour >= peakPeriod.start || hour < peakPeriod.end;
      }
    } catch(e) {
      return false;
    }
  };

  const handleGenerateSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/plan-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.slice(0, 3).map((t) => ({ title: t.title, priority: t.priority, effort: t.effort })),
          habits: habits.map((h) => ({ name: h.name, count: h.targetCount })),
          workingHours: "09:00 - 17:30",
          focusTarget: 4,
          energyLevel: "High"
        }),
      });

      if (!response.ok) {
        throw new Error("Plan failed");
      }

      const resData = await response.json();
      if (resData.schedule && resData.schedule.length > 0) {
        setSchedule(resData.schedule);
      }
      if (resData.coachingAdvice) {
        setCoachAdvice(resData.coachingAdvice);
      }
      if (resData.burnoutRisk) {
        setBurnoutRisk(resData.burnoutRisk);
      }
    } catch (err) {
      console.error(err);
      onAlert("⚠️ Request Timeout or Standby Mode. Generated Simulated Cognitive Schedule.", "warning");
      
      // Fallback Schedule
      const fallback: ScheduleUnit[] = [
        { time: "09:00", description: "High-Caliber Focus Block: " + (tasks[0]?.title || "Critical Work"), duration: 38, type: "focus" },
        { time: "09:38", description: "Mindful Recovery Break Interval", duration: 8, type: "break" },
        { time: "09:46", description: "Habit Integration: " + (habits[0]?.name || "Meditative Breath"), duration: 15, type: "habit" },
        { time: "10:01", description: "Focused Block 2: " + (tasks[1]?.title || "Document Specifications"), duration: 38, type: "focus" },
        { time: "10:39", description: "Inbox Cleansing Buffer Interval", duration: 20, type: "buffer" }
      ];
      setSchedule(fallback);
      setCoachAdvice("Standby guidance: Schedule focus cycles according to task friction and reduce long visual exposures.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Input backlog items context */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 block">Today's Blueprint Inputs</h3>
          <p className="text-xs text-slate-400 mb-4">The Planner aggregates these items to align tasks with attention windows.</p>
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Backlogs Context (Top 3)</span>
              <div className="space-y-2">
                {tasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700">
                    <span className="block font-semibold truncate">{t.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Priority: {t.priority} • Energy: {t.energy}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Priority Habits (Top 2)</span>
              <div className="space-y-2">
                {habits.slice(0, 2).map((h) => (
                  <div key={h.id} className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                    <span>{h.name}</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 font-mono font-bold px-1.5 py-0.5 rounded">Streak: {h.streak}d</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Metrics blocks */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex gap-1 items-center text-xs text-brand-secondary font-bold font-mono">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                ANALYTICAL PREDICTION
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Burnout Fatigue Target</span>
                <h4 className={`text-xl font-bold font-display mt-1 ${
                  burnoutRisk === "Low" || burnoutRisk === "Low Risk" ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {burnoutRisk}
                </h4>
                <p className="text-xs text-slate-400 mt-1">Fatigue calculation evaluated based on active sprint density.</p>
              </div>
            </div>
          </div>

          {/* New Chronobiology Peak Focus Block Card */}
          <div className="bg-gradient-to-tr from-indigo-950 to-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-md">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5 text-brand-secondary animate-pulse" />
                AI Peak Focus Window
              </div>
              <div>
                <span className="text-[17px] font-bold font-display block text-brand-secondary">{peakPeriod.text}</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Based on your focus sessions history, your cognitive stamina peaks during this block. We have labeled these prime recommended slots on your calendar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center & Right Column: Interactive Timeline */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Flow State Schedule</h3>
              <p className="text-xs text-slate-400">Alternating deep focus work loops designed for energy conservation</p>
            </div>
            
            <button
              disabled={loading}
              onClick={handleGenerateSchedule}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-secondary animate-pulse" />
              {loading ? "Re-aligning blocks..." : "Re-Schedule with AI Planning"}
            </button>
          </div>

          {/* Coach Advice Bubble */}
          <div className="p-3.5 rounded-2xl bg-[#FF5A5F]/5 border border-[#FF5A5F]/15 text-slate-700 text-xs leading-relaxed mb-6">
            <span className="font-semibold text-[#FF5A5F] block mb-1">AI Coach Tactical Advice:</span>
            "{coachAdvice}"
          </div>

          {/* Timeline Sequence */}
          <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pb-2">
            {schedule.map((u, idx) => {
              const isPeakSlot = isTimeInPeakPeriod(u.time);
              return (
                <div key={idx} className="flex gap-4 items-start relative font-sans">
                  {/* Timeline node bullet */}
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all font-mono text-xs font-bold ${
                    u.type === "focus" ? "bg-red-50 border-brand-primary text-brand-primary" :
                    u.type === "break" ? "bg-emerald-50 border-brand-success text-brand-success" :
                    u.type === "habit" ? "bg-indigo-50/40 border-indigo-500 text-indigo-700" :
                    "bg-slate-50 border-slate-300 text-slate-500"
                  }`}>
                    {idx + 1}
                  </div>

                  <div className={`flex-1 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    isPeakSlot 
                      ? "bg-indigo-50/30 border-indigo-150 shadow-sm" 
                      : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                  }`}>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200/50 px-2 py-0.5 rounded-md">⏰ {u.time}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-mono font-bold ${
                          u.type === "focus" ? "bg-red-50 text-brand-primary border border-red-100" :
                          u.type === "break" ? "bg-emerald-50 text-brand-success border border-emerald-200" :
                          u.type === "habit" ? "bg-indigo-50 text-indigo-600 border border-indigo-200" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {u.type === "focus" ? "Work Block" : u.type === "break" ? "Breathing recovery" : u.type === "habit" ? "Habit loop" : "Admin buffer"}
                        </span>

                        {isPeakSlot && (
                          <span className="bg-brand-secondary/25 text-indigo-950 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-brand-secondary/40 animate-pulse">
                            ⚡ PEAK ATTENTION
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm">{u.description}</p>
                    </div>

                    <span className="text-xs text-slate-400 font-mono whitespace-nowrap shrink-0 bg-white border border-slate-150 px-2 py-1 rounded-lg">
                      ⏱ {u.duration} Minutes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
