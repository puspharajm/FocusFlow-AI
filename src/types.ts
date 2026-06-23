export type PriorityLevel = "low" | "medium" | "high";
export type EnergyLevel = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  etaMinutes?: number;
  effort?: "low" | "medium" | "high";
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  effort: EnergyLevel;
  energy: EnergyLevel;
  deadline?: string;
  status: TaskStatus;
  category: string;
  subtasks: SubTask[];
  createdAt: string;
  aiBreakdownRequested?: boolean;
  quickNote?: string;
  completedAt?: string;
  estimatedMinutes?: number;
  estimated_duration?: number;
  urgency_score?: number;
  effort_score?: number;
}

export interface Habit {
  id: string;
  name: string;
  category: "work" | "health" | "minimalism" | "focus" | "social";
  streak: number;
  logs: string[]; // dates e.g. "2026-06-22"
  targetCount: number; // times per week e.g. 5
}

export interface Goal {
  id: string;
  title: string;
  timeframe: "daily" | "weekly" | "monthly" | "quarterly";
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
  deadline: string;
}

export interface FocusSession {
  id: string;
  timestamp: string; // date string
  taskTitle: string;
  durationMinutes: number;
  breakMinutes: number;
  efficiencyScore: number; // 0-100 focus score
  stressRatingAfter?: number; // 1-10 scale
}

export interface KnowledgeNote {
  id: string;
  title: string;
  content: string;
  category: string;
  lastModified: string;
  tags: string[];
}

export interface UserProfile {
  name: string;
  attentionSpanMinutes: number;
  workingHours: string; // e.g. "09:00 - 17:00"
  preferredEnergy: string;
  onboardingCompleted: boolean;
  xp: number;
  level: number;
  weeklyTargetHours: number;
  burnoutWarningScore: number; // 0-100 index
  burnoutStatus: "Optimal Focus" | "Mild Exhaustion" | "Burnout Warning" | "Critical Alert";
}

export interface TeamSprintInfo {
  id: string;
  name: string;
  role: string;
  activeStatus: "focusing" | "on break" | "offline";
  currentTask?: string;
  weeklyHours: number;
  focusScore: number;
}

export interface FocusChallenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  rewardXp: number;
  joined: boolean;
  completed: boolean;
  type: "streak" | "task_count" | "focus_hours";
  category: string;
}
