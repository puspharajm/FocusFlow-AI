import React from "react";
import { 
  Flame, 
  Trophy, 
  Target, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Lock, 
  CheckCircle2, 
  UserCheck, 
  ArrowUpRight,
  Shield, 
  Clock 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FocusChallenge, UserProfile } from "../types";

interface FocusChallengesProps {
  challenges: FocusChallenge[];
  profile: UserProfile;
  onChallengesChange: (challenges: FocusChallenge[]) => void;
  onXpEarned: (amount: number) => void;
  onAlert?: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function FocusChallenges({
  challenges,
  profile,
  onChallengesChange,
  onXpEarned,
  onAlert
}: FocusChallengesProps) {

  const handleJoinChallenge = (id: string) => {
    const updated = challenges.map(c => {
      if (c.id === id) {
        if (onAlert) onAlert(`Successfully entered the "${c.title}" challenge!`, "success");
        return { ...c, joined: true };
      }
      return c;
    });
    onChallengesChange(updated);
  };

  const handleLeaveChallenge = (id: string) => {
    const updated = challenges.map(c => {
      if (c.id === id) {
        if (onAlert) onAlert(`Left "${c.title}" challenge. Progress preserved. `, "info");
        return { ...c, joined: false };
      }
      return c;
    });
    onChallengesChange(updated);
  };

  const handleIncrementProgress = (id: string) => {
    const updated = challenges.map(c => {
      if (c.id === id && c.joined && !c.completed) {
        const nextVal = Math.min(c.targetValue, Number((c.currentValue + 1).toFixed(1)));
        const isCompletedNow = nextVal >= c.targetValue;
        
        if (isCompletedNow) {
          onXpEarned(c.rewardXp);
          if (onAlert) onAlert(`🏆 Challenge Completed: "${c.title}"! Earned +${c.rewardXp} XP!`, "success");
          return { ...c, currentValue: nextVal, completed: true };
        } else {
          if (onAlert) onAlert(`Progress logged on challenge "${c.title}"!`, "success");
          return { ...c, currentValue: nextVal };
        }
      }
      return c;
    });
    onChallengesChange(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="font-display text-lg font-bold text-slate-950">System Focus Challenges & Arena</h2>
        <p className="text-xs text-slate-400">Join intensive attention sprints, track sequential streaks, and dominate weekly league leagues.</p>
      </div>

      {/* Arena Overview Header cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border border-amber-500/20 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">Conscious Streak Status</span>
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">
              {challenges.find(c => c.id === "challenge-1")?.currentValue || 0} Days Running
            </h3>
            <p className="text-[10px] text-slate-400 leading-none">Established focus sequence habit</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border border-indigo-500/20 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Completed Sprints</span>
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">
              {challenges.filter(c => c.completed).length} Achieved
            </h3>
            <p className="text-[10px] text-slate-400 leading-none">Unlocking massive XP rewards</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border border-emerald-500/20 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Current Arena Ranking</span>
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">Valkyrie Platinum III</h3>
            <p className="text-[10px] text-slate-400 leading-none">Top 12% among enterprise peers</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Playable Challenges (Col-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-brand-primary" /> Active Challenges Catalog
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Participating: {challenges.filter(c => c.joined).length} total
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {challenges.map((challenge) => {
                const percent = Math.min(100, Math.round((challenge.currentValue / challenge.targetValue) * 100));
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    key={challenge.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      challenge.completed 
                        ? "bg-emerald-50/20 border-emerald-150" 
                        : challenge.joined 
                          ? "bg-white border-brand-primary shadow-sm" 
                          : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono tracking-widest ${
                            challenge.completed 
                              ? "bg-emerald-100 text-emerald-600" 
                              : challenge.joined 
                                ? "bg-indigo-50 text-indigo-650"
                                : "bg-slate-100 text-slate-500"
                          }`}>
                            {challenge.category}
                          </span>
                          <span className="text-[10px] text-amber-500 font-mono font-bold flex items-center gap-0.5">
                            ⚡ +{challenge.rewardXp} XP Reward
                          </span>
                        </div>

                        <h4 className="font-semibold text-sm sm:text-base text-slate-900 leading-snug">
                          {challenge.title}
                        </h4>
                        
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>

                      {/* Action trigger button */}
                      <div className="shrink-0 flex items-center gap-2">
                        {challenge.completed ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-emerald-250">
                            <CheckCircle2 className="w-4 h-4" /> Achieved!
                          </div>
                        ) : !challenge.joined ? (
                          <button
                            onClick={() => handleJoinChallenge(challenge.id)}
                            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition-all block text-center"
                          >
                            Enter Challenge
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleIncrementProgress(challenge.id)}
                              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-150 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              Log Progress
                            </button>
                            <button
                              onClick={() => handleLeaveChallenge(challenge.id)}
                              className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-xl transition-all cursor-pointer"
                              title="Abandon challenge"
                            >
                              Leave
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Progress slider panel */}
                    {challenge.joined && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                          <span>Incremental Progression Tracker</span>
                          <span className="font-bold text-slate-800">
                            {challenge.currentValue} / {challenge.targetValue} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-350 ${
                              challenge.completed ? "bg-emerald-500" : "bg-brand-primary"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
        </div>

        {/* League and competitive ladders (Col-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-secondary" /> League Brackets
            </h3>
          </div>

          <div className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-slate-200 p-5 rounded-3xl border border-slate-800 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-semibold text-xs text-white">Valkyrie Platinum Ladder</h4>
                <p className="text-[10px] text-slate-400">Time remaining: 2 Days 14 hours</p>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-400">
              Only the top 3 focus users on the ladder advance to the prestigious Diamond Horizon bracket at the weekly boundary. Work hard to remain in the promotion pipeline!
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {[
                { name: "Lucas Vance", xp: 4850, rank: "1st", badge: "Legend" },
                { name: "Puspharaj M", xp: profile.xp, rank: "2nd", isMe: true },
                { name: "James Chen", xp: 3950, rank: "3rd" },
                { name: "Sarah Jenkins", xp: 2100, rank: "4th" }
              ].map((ladderUser, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                    ladderUser.isMe ? "bg-brand-primary/10 border border-brand-primary/20 text-slate-100 font-semibold" : "text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 text-slate-500 w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {ladderUser.rank}
                    </span>
                    <span className="truncate">{ladderUser.name}</span>
                  </div>
                  <span className="font-mono text-[10px]">{ladderUser.xp} XP</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
