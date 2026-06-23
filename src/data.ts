import { Task, Habit, Goal, FocusSession, KnowledgeNote, UserProfile, TeamSprintInfo, FocusChallenge } from "./types";

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Puspharaj M",
  attentionSpanMinutes: 38,
  workingHours: "09:00 - 17:30",
  preferredEnergy: "High",
  onboardingCompleted: true,
  xp: 1450,
  level: 4,
  weeklyTargetHours: 24,
  burnoutWarningScore: 28,
  burnoutStatus: "Optimal Focus"
};

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Refactor core authentication engine to multi-tenant structures",
    description: "Align route gateways with modern CJS esbuild outputs, cleaning old session storage hooks.",
    priority: "high",
    effort: "high",
    energy: "high",
    deadline: "2026-06-25",
    status: "in_progress",
    category: "Engineering",
    createdAt: "2026-06-20",
    subtasks: [
      { id: "sub-1-1", title: "Audit middleware route entrypoints", completed: true },
      { id: "sub-1-2", title: "Build robust JWT decoding hooks", completed: false },
      { id: "sub-1-3", title: "Write container volume tests", completed: false }
    ]
  },
  {
    id: "task-2",
    title: "Draft performance optimization specifications",
    description: "Prepare documentation regarding asset cache optimization, custom code splitting in webpack, and lazy API clients.",
    priority: "medium",
    effort: "low",
    energy: "medium",
    deadline: "2026-06-28",
    status: "todo",
    category: "Architecture",
    createdAt: "2026-06-21",
    subtasks: []
  },
  {
    id: "task-3",
    title: "Review daily team burn rates & velocity charts",
    description: "Synthesize weekly velocity metric reports for the executive team reviews.",
    priority: "low",
    effort: "medium",
    energy: "low",
    deadline: "2026-06-24",
    status: "done",
    category: "Operations",
    createdAt: "2026-06-19",
    subtasks: [
      { id: "sub-3-1", title: "Export JIRA status statistics", completed: true },
      { id: "sub-3-2", title: "Compare sprint 4 charts with budget projections", completed: true }
    ]
  }
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: "habit-1",
    name: "Focus Meditative Breath",
    category: "health",
    streak: 8,
    logs: ["2026-06-22", "2026-06-21", "2026-06-20", "2026-06-19", "2026-06-18", "2026-06-17", "2026-06-16", "2026-06-15"],
    targetCount: 7
  },
  {
    id: "habit-2",
    name: "Complete 4 Deep Focus Blocks",
    category: "focus",
    streak: 4,
    logs: ["2026-06-22", "2026-06-21", "2026-06-20", "2026-06-19"],
    targetCount: 5
  },
  {
    id: "habit-3",
    name: "Document Technical Insights",
    category: "work",
    streak: 2,
    logs: ["2026-06-22", "2026-06-21"],
    targetCount: 3
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: "goal-1",
    title: "Execute 40 Productive Focus Hours",
    timeframe: "weekly",
    category: "Focus",
    targetValue: 40,
    currentValue: 26.5,
    unit: "hours",
    completed: false,
    deadline: "2026-06-28"
  },
  {
    id: "goal-2",
    title: "Keep Daily Focus Streak Intact",
    timeframe: "daily",
    category: "Habits",
    targetValue: 1,
    currentValue: 1,
    unit: "day",
    completed: true,
    deadline: "2026-06-23"
  },
  {
    id: "goal-3",
    title: "Draft Q3 Engineering Competency Roadmap",
    timeframe: "quarterly",
    category: "Milestones",
    targetValue: 100,
    currentValue: 45,
    unit: "percent",
    completed: false,
    deadline: "2026-09-30"
  }
];

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: "session-1",
    timestamp: "2026-06-22T10:15:00.000Z",
    taskTitle: "Refactor core authentication engine",
    durationMinutes: 38,
    breakMinutes: 8,
    efficiencyScore: 92,
    stressRatingAfter: 3
  },
  {
    id: "session-2",
    timestamp: "2026-06-22T14:40:00.000Z",
    taskTitle: "Draft performance optimization specifications",
    durationMinutes: 45,
    breakMinutes: 10,
    efficiencyScore: 84,
    stressRatingAfter: 5
  },
  {
    id: "session-3",
    timestamp: "2026-06-21T09:30:00.000Z",
    taskTitle: "Review daily team burn rates",
    durationMinutes: 30,
    breakMinutes: 5,
    efficiencyScore: 96,
    stressRatingAfter: 2
  }
];

export const INITIAL_NOTES: KnowledgeNote[] = [
  {
    id: "note-1",
    title: "Cognitive Shifting Deficit Elimination",
    content: "Multitasking decays memory density and induces high stress peaks. To eliminate context switching, FocusFlow AI recommends bundling small transactional operations (communication, email reviews) into one 30-min window, keeping deep work blocks entirely focused and distraction-free.",
    category: "Productivity Science",
    lastModified: "2026-06-22T18:30:00.000Z",
    tags: ["Cognitive Science", "Friction", "Attention Tuning"]
  },
  {
    id: "note-2",
    title: "Tailwind CSS v4 Layout Notes",
    content: "Since Tailwind CSS v4 utilizes highly performant, directly loaded CSS @import structures, avoid using duplicate CSS configs. Keep components lightweight, modular, and use rich display fonts paired with clean high-contrast colors.",
    category: "Programming Notes",
    lastModified: "2026-06-21T11:45:00.000Z",
    tags: ["Frontend", "TailwindCSS", "Code Standards"]
  }
];

export const INITIAL_TEAM_Sprint_INFO: TeamSprintInfo[] = [
  {
    id: "team-1",
    name: "Divya Balan",
    role: "Senior AI Engineer",
    activeStatus: "focusing",
    currentTask: "Training fine-tuned attention predictor models",
    weeklyHours: 32.5,
    focusScore: 94
  },
  {
    id: "team-2",
    name: "James Chen",
    role: "Lead Full-Stack Architect",
    activeStatus: "on break",
    currentTask: "Deploying esbuild server bundles to Docker",
    weeklyHours: 28.1,
    focusScore: 88
  },
  {
    id: "team-3",
    name: "Pooja Sharma",
    role: "UX Researcher & Designer",
    activeStatus: "offline",
    weeklyHours: 19.4,
    focusScore: 91
  }
];

export const INITIAL_CHALLENGES: FocusChallenge[] = [
  {
    id: "challenge-1",
    title: "Daily Streak Marathon",
    description: "Maintain a consecutive daily focus session log streak to establish deep cognitive rhythms.",
    targetValue: 3,
    currentValue: 2,
    rewardXp: 350,
    joined: true,
    completed: false,
    type: "streak",
    category: "Rhythm"
  },
  {
    id: "challenge-2",
    title: "Sprint Horizon Focus",
    description: "Conclude 5 intensive engineering sprints in the Task Workspace backlog.",
    targetValue: 5,
    currentValue: 1,
    rewardXp: 500,
    joined: false,
    completed: false,
    type: "task_count",
    category: "Execution"
  },
  {
    id: "challenge-3",
    title: "Weekend Focus Warrior",
    description: "Log at least 4 focus hours inside the focus timer mode.",
    targetValue: 4,
    currentValue: 1.5,
    rewardXp: 400,
    joined: false,
    completed: false,
    type: "focus_hours",
    category: "Endurance"
  }
];

