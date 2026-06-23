import { Users, Trophy, Shield, ArrowUpRight, Award, MessageSquare } from "lucide-react";
import { TeamSprintInfo, UserProfile } from "../types";

interface WorkspaceLeaguesProps {
  profile: UserProfile;
  teamMembers: TeamSprintInfo[];
}

export default function WorkspaceLeagues({ profile, teamMembers }: WorkspaceLeaguesProps) {
  
  // Simulated friends scoreboard for leagues
  const leagueLeaderboard = [
    { rank: 1, name: "Divya Balan", level: 6, xp: 5400, badge: "Master Architect", isUser: false },
    { rank: 2, name: "Lucas Vance", level: 5, xp: 4850, badge: "Deep-block Legend", isUser: false },
    { rank: 3, name: profile.name + " (You)", level: profile.level, xp: profile.xp, badge: "Focus Apprentice", isUser: true },
    { rank: 4, name: "James Chen", level: 4, xp: 3950, badge: "Concurrency King", isUser: false },
    { rank: 5, name: "Sarah Jenkins", level: 3, xp: 2100, badge: "Consistent Gilder", isUser: false },
  ].sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Team Productivity Workspace (Col-7) */}
      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-brand-primary" />
            Company Workspace Telemetry
          </h3>
          <p className="text-xs text-slate-400">Review co-builder focus streams and collective sprint velocities.</p>
        </div>

        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-4 border border-slate-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{member.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">({member.role})</span>
                </div>

                {member.currentTask ? (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Currently:</span> {member.currentTask}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">Currently offline and recovering attention reserves.</p>
                )}
              </div>

              {/* Status capsule */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                <div className="text-right sm:text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Weekly hours logged</span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{member.weeklyHours}h</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    member.activeStatus === "focusing" ? "bg-emerald-500 animate-pulse" :
                    member.activeStatus === "on break" ? "bg-amber-400" : "bg-slate-300"
                  }`} />
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    member.activeStatus === "focusing" ? "text-emerald-550" :
                    member.activeStatus === "on break" ? "text-amber-500" : "text-slate-400"
                  }`}>
                    {member.activeStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workspace telemetry metrics */}
        <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Collective Focus index</span>
            <span className="text-lg font-mono font-bold text-slate-800">91% Flow</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Collective Sprint Hours</span>
            <span className="text-lg font-mono font-bold text-slate-800">80 hours</span>
          </div>
        </div>
      </div>

      {/* Focus League Friendship Leaderboard (Col-5) */}
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-brand-secondary animate-bounce" />
            Valkyrie League Scores
          </h3>
          <p className="text-xs text-slate-400">Weekly calibration ladder. Finish tasks and logs to surge ranks.</p>
        </div>

        <div className="space-y-3">
          {leagueLeaderboard.map((item) => (
            <div key={item.name} className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
              item.isUser
                ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-brand-primary/20"
                : "bg-slate-50 border-slate-150 text-slate-700"
            }`}>
              <div className="flex items-center gap-3">
                {/* Seed index */}
                <span className={`text-xs font-bold font-mono w-4 text-center ${
                  item.rank === 1 ? "text-brand-primary" : item.rank === 2 ? "text-brand-secondary" : "text-slate-400"
                }`}>
                  #{item.rank}
                </span>

                <div>
                  <h4 className="font-semibold text-xs sm:text-sm">{item.name}</h4>
                  <span className={`text-[10px] block font-mono ${
                    item.isUser ? "text-brand-secondary" : "text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* XP status */}
              <div className="text-right">
                <span className="font-mono text-xs font-bold block">{item.xp} XP</span>
                <span className="text-[9px] block opacity-80">Level {item.level}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Gamified Milestone Achievements box */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Secured Badges</span>
          
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100/60 text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-secondary shrink-0" />
              <div className="space-y-0.5">
                <span className="font-bold text-[10px] block leading-none">Streaker Master</span>
                <span className="text-[9px] text-slate-400">Log 4 consecutive days</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60 text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="space-y-0.5">
                <span className="font-bold text-[10px] block leading-none">Binaural Pioneer</span>
                <span className="text-[9px] text-slate-400">Simulate ambient sound loops</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
