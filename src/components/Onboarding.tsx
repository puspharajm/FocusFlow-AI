import React, { useState } from "react";
import { Sparkles, Target, Clock, ArrowRight } from "lucide-react";
import { UserProfile } from "../types";

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [hours, setHours] = useState(25);
  const [span, setSpan] = useState(38);
  const [category, setCategory] = useState("Engineering");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({
      name: name.trim(),
      weeklyTargetHours: hours,
      attentionSpanMinutes: span,
      preferredEnergy: "High",
      onboardingCompleted: true,
      xp: 100,
      level: 1,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1220] to-[#121E36] flex items-center justify-center p-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-brand-dark to-brand-dark opacity-80 pointer-events-none" />

      <div className="relative max-w-lg w-full bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl transition-all duration-300">
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary p-0.5">
            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-success rounded-full ring-2 ring-slate-900" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            FocusFlow AI
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            The next-generation attention operating system for high-performing builders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: User Identity */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              What should the AI coach call you?
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rachel Foster"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all text-white placeholder:text-slate-600"
            />
          </div>

          {/* Section 2: Weekly Performance Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Weekly Focus Target
              </label>
              <span className="text-brand-primary font-mono text-xs font-bold bg-brand-primary/10 px-2 py-0.5 rounded-md">
                {hours} hours / week
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-slate-500" />
              <input
                type="range"
                min="10"
                max="60"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full accent-brand-primary bg-slate-950 cursor-pointer h-1.5 rounded-lg"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Recommended: 30 hours for elite builders, 15 hours for balanced execution.
            </p>
          </div>

          {/* Section 3: Attention Window Optimization */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                AI Focus Block Calibration
              </label>
              <span className="text-brand-secondary font-mono text-xs font-bold bg-brand-secondary/10 px-2 py-0.5 rounded-md">
                {span} min sessions
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <div className="grid grid-cols-3 gap-2 w-full">
                {[25, 38, 50].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSpan(m)}
                    className={`py-2 text-xs font-mono rounded-xl border transition-all ${
                      span === m
                        ? "bg-slate-800/80 border-brand-secondary text-brand-secondary font-bold"
                        : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-900 text-slate-400"
                    }`}
                  >
                    {m} Min
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Our psychologists suggest a custom <span className="text-brand-secondary">38-minute focus window</span> to match native circadian attention intervals.
            </p>
          </div>

          {/* Core field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Primary Workflow Context
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-brand-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-300"
            >
              <option value="Engineering">Software Engineering</option>
              <option value="Architecture">System Architecture</option>
              <option value="Design">Product Design</option>
              <option value="Operations">Operations & Scale</option>
              <option value="Academics">Academic Research</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-transform hover:scale-[1.01] cursor-pointer"
          >
            Deploy My Focus Workspace
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
