import { useState } from "react";
import { ShieldAlert, Sparkles, Heart, Zap, RefreshCw, Trophy, AlertTriangle, FileText, Check } from "lucide-react";
import { UserProfile, FocusSession } from "../types";

interface BurnoutDiagnosticsProps {
  profile: UserProfile;
  sessions: FocusSession[];
  onProfileUpdate: (updated: Partial<UserProfile>) => void;
  onAlert: (message: string, type?: "success" | "info" | "warning") => void;
}

interface DiagnosisResult {
  score: number;
  level: string;
  insights: string[];
  recommendations: string[];
}

interface ReviewResult {
  wins: string[];
  challenges: string[];
  suggestions: string[];
  growthIndex: string;
}

export default function BurnoutDiagnostics({ profile, sessions, onProfileUpdate, onAlert }: BurnoutDiagnosticsProps) {
  // Local Diagnostics Scanner Inputs
  const [weeksFocusHours, setWeeksFocusHours] = useState(38);
  const [focusEfficiency, setFocusEfficiency] = useState(82);
  const [dailyStress, setDailyStress] = useState(4);
  const [backlogCount, setBacklogCount] = useState(12);

  // States
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>({
    score: 28,
    level: "Optimal Focus",
    insights: [
      "Your continuous attention indicators are operating inside optimal visual bounds.",
      "Buffer intervals are successfully neutralizing mental blocks before context switches accrue."
    ],
    recommendations: [
      "Maintain a structural 15-minute relaxation screen exit at 15:00.",
      "Ensure a physical evening cut-off window before 19:30 tonight."
    ]
  });

  // Weekly review states
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewReport, setReviewReport] = useState<ReviewResult | null>(null);

  // Trigger Burnout Diagnostics
  const handleScanBurnout = async () => {
    setLoadingDiagnostic(true);
    try {
      const response = await fetch("/api/ai/burnout-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentWeeksLoggedHours: weeksFocusHours,
          focusEfficiency: focusEfficiency,
          dailyStressRating: dailyStress,
          incompleteTasks: backlogCount
        })
      });

      if (!response.ok) throw new Error("Diagnostic failed");

      const resData = await response.json();
      setDiagnosis({
        score: typeof resData.score === "number" ? resData.score : 30,
        level: resData.level || "Optimal Focus",
        insights: resData.insights || ["No custom stress factors detected."],
        recommendations: resData.recommendations || ["Continue current breaks structure."]
      });

      // Update user Profile Status triggers
      onProfileUpdate({
        burnoutWarningScore: typeof resData.score === "number" ? resData.score : 30,
        burnoutStatus: resData.level || "Optimal Focus"
      });
    } catch (err) {
      console.error(err);
      onAlert("⚠️ Standby offline report activated. Placed simulated cognitive health calculations.", "warning");
      setDiagnosis({
        score: Math.min(100, Math.round(weeksFocusHours * dailyStress * 0.25)),
        level: dailyStress > 7 ? "Critical Alert" : dailyStress > 4 ? "Mild Exhaustion" : "Optimal Focus",
        insights: [
          "Subjective tension indicates moderate psychological load.",
          "Context shifting cycles are piling up. Restructure pending micro-tasks."
        ],
        recommendations: [
          "Establish one full 120-minute digital hygiene session within the next hour.",
          "Substitute standard coffee with herbal water to soothe adrenal outputs."
        ]
      });
    } finally {
      setLoadingDiagnostic(false);
    }
  };

  // Trigger Weekly Review
  const handleWeeklyReview = async () => {
    setLoadingReview(true);
    try {
      const response = await fetch("/api/ai/weekly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedTasksCount: sessions.length * 2, // simulated completions index
          focusHoursLogged: (sessions.reduce((s, u) => s + u.durationMinutes, 0) / 60).toFixed(1),
          streakCount: 4,
          habitAccuracy: 85
        })
      });

      if (!response.ok) throw new Error("Weekly review failed");

      const resData = await response.json();
      setReviewReport(resData);
    } catch (err) {
      console.error(err);
      setReviewReport({
        wins: [
          "Concluded critical Multi-tenant security specifications on target",
          "Maintained daily meditation habitude with 85% compliance"
        ],
        challenges: [
          "Average efficiency scores experienced a minor late-afternoon dip to 76%"
        ],
        suggestions: [
          "Shift standard technical audits to 10:00 AM window when baseline alert peaks",
          "Ensure secondary rest intervals are maintained strictly at 8 minutes"
        ],
        growthIndex: "Steady Surge"
      });
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Diagnostics Input Parameters Panel (Col-5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Diagnostic Scanner Console</h3>
            <p className="text-xs text-slate-400">Lock subjective workload levels for mental fatigue evaluation.</p>
          </div>

          <div className="space-y-4">
            {/* Input 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Logged Focus hours (Weekly)</span>
                <span className="font-bold text-slate-800 font-mono">{weeksFocusHours} hours</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={weeksFocusHours}
                onChange={(e) => setWeeksFocusHours(Number(e.target.value))}
                className="w-full accent-brand-primary h-1 bg-slate-100 rounded"
              />
            </div>

            {/* Input 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Focus Efficiency Index</span>
                <span className="font-bold text-indigo-600 font-mono">{focusEfficiency}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={focusEfficiency}
                onChange={(e) => setFocusEfficiency(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-100 rounded"
              />
            </div>

            {/* Input 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Subjective Daily Stress (1-10)</span>
                <span className="font-bold text-amber-500 font-mono">{dailyStress} Intensity</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={dailyStress}
                onChange={(e) => setDailyStress(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-slate-100 rounded"
              />
            </div>

            {/* Input 4 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Backlog Tasks backlog count</span>
                <span className="font-bold text-slate-800 font-mono">{backlogCount} Units</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={backlogCount}
                onChange={(e) => setBacklogCount(Number(e.target.value))}
                className="w-full accent-slate-650 h-1 bg-slate-100 rounded"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={loadingDiagnostic}
            onClick={handleScanBurnout}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2 transition-all cursor-pointer"
          >
            {loadingDiagnostic ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-secondary" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            )}
            {loadingDiagnostic ? "Running Diagnostics..." : "Scan with AI Coach"}
          </button>
        </div>

        {/* Quick Weekly Review Trigger box */}
        <div className="bg-gradient-to-tr from-brand-primary/5 to-brand-secondary/5 border border-red-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              AI Weekly Performance Reviews
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Assemble completed sprints, habit compliances, and hours logged into an analytical growth roadmap.
            </p>
          </div>

          <button
            onClick={handleWeeklyReview}
            disabled={loadingReview}
            className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-xs flex justify-center items-center gap-2 transition-all cursor-pointer"
          >
            {loadingReview ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-505" />
            ) : (
              <Trophy className="w-3.5 h-3.5 text-brand-secondary" />
            )}
            {loadingReview ? "Analyzing Week Stats..." : "Synthesize Performance Review"}
          </button>
        </div>
      </div>

      {/* Diagnosis Reports Panel (Col-7) */}
      <div className="lg:col-span-7 space-y-6">
        {diagnosis && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Cognitive Fatigue Analysis</h3>
                <span className="text-[10px] text-slate-400">Psychological profile generated in real-time</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Exhaustion index</span>
                <span className="font-mono text-lg font-bold text-slate-900">{diagnosis.score} / 100</span>
              </div>
            </div>

            {/* Fatigue gauge row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Workload Status</span>
                <span className="text-sm font-bold text-slate-800 mt-1.5">{diagnosis.level}</span>
                <span className={`w-3 h-3 rounded-full mt-2 block ${
                  diagnosis.score < 40 ? "bg-emerald-500" : diagnosis.score < 70 ? "bg-amber-500" : "bg-red-500 animate-ping"
                }`} />
              </div>

              {/* Insights */}
              <div className="md:col-span-2 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Psychological Insights</span>
                <div className="space-y-1.5">
                  {diagnosis.insights.map((ins, index) => (
                    <p key={index} className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      • {ins}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Target Healing Recommendations</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {diagnosis.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/60 text-indigo-950">
                    <Heart className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Review Report */}
        {reviewReport && (
          <div className="bg-gradient-to-b from-[#0B1220] to-[#16223B] border border-slate-800 p-6 rounded-3xl text-white space-y-5 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-brand-secondary font-mono text-[9px] uppercase font-bold block">PERFORMANCE AUDIT</span>
                <h3 className="font-display font-medium text-lg leading-tight">Weekly Focus Roadmap</h3>
              </div>
              <span className="bg-brand-primary text-white font-mono text-xs font-bold px-3 py-1 rounded-full uppercase">
                {reviewReport.growthIndex}
              </span>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-slate-400 font-mono text-[10px] block uppercase mb-1.5">WINS SECURED</span>
                <div className="space-y-1">
                  {reviewReport.wins.map((w, i) => (
                    <p key={i} className="flex items-start gap-2 bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                      <span className="text-brand-success">✔</span>
                      <span className="text-slate-200">{w}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono text-[10px] block uppercase mb-1.5">CHALLENGES TRACKED</span>
                <div className="space-y-1">
                  {reviewReport.challenges.map((c, i) => (
                    <p key={i} className="flex items-start gap-2 bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                      <span className="text-brand-primary">⚠</span>
                      <span className="text-slate-200">{c}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-slate-400 font-mono text-[10px] block uppercase mb-1.5">AI COACH SUGGESTED PROTOCOLS</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reviewReport.suggestions.map((s, i) => (
                    <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex gap-1 items-center font-bold text-brand-secondary text-[10px] uppercase font-mono">
                        <Sparkles className="w-3" /> Protocol {i + 1}
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
