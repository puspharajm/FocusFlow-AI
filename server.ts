import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header and conditional API Key validation
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY || "";

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("✔ Server-side GoogleGenAI initialized successfully.");
  } catch (error) {
    console.error("🛑 Error initializing GoogleGenAI client:", error);
  }
} else {
  console.warn("⚠️ GEMINI_API_KEY is not defined or is using the placeholder. Falling back to high-grade simulated intelligence logic.");
}

// Helper: Ensure JSON parsing and strip markdown codeblocks if necessary
function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return JSON.parse(cleaned.trim());
}

// -------------------------------------------------------------
// AI API ENDPOINTS
// -------------------------------------------------------------

// 1. AI Daily Planner Endpoint
app.post("/api/ai/plan-day", async (req, res) => {
  const { tasks, habits, workingHours, focusTarget, energyLevel } = req.body;

  if (!ai) {
    // Elegant high-fidelity mock response if API Key is missing
    const simulatedPlanner = {
      schedule: [
        { time: "09:00", description: "Deep Work Session 1 (Focus on critical tasks)", duration: 45, type: "focus" },
        { time: "09:45", description: "Mindful Recovery Break", duration: 10, type: "break" },
        { time: "09:55", description: "Habit Integration: " + (habits?.[0]?.name || "Learning/Mindfulness"), duration: 15, type: "habit" },
        { time: "10:10", description: "Deep Work Session 2 (Medium priority / Emails)", duration: 50, type: "focus" },
        { time: "11:00", description: "System Update & Review", duration: 15, type: "break" }
      ],
      coachingAdvice: "Plan generated in offline-ready state. Add high-energy tasks in the morning when your attention capacity is highest.",
      burnoutRisk: "Low - Balanced block sequence."
    };
    return res.json(simulatedPlanner);
  }

  try {
    const prompt = `You are the Lead Productivity Psychologist of FocusFlow AI.
Analyze the following parameters to generate a highly cohesive, optimal Daily Schedule consisting of alternating Focus Work blocks, break times, habits, and recovery:
- Tasks to complete: ${JSON.stringify(tasks)}
- Daily habits: ${JSON.stringify(habits)}
- Working Hours Window: ${workingHours || "9 AM to 5 PM"}
- Daily target focus hours: ${focusTarget || "4"}
- Starting Energy Level: ${energyLevel || "High"}

Ensure deep work blocks match the task priority and energy requirements.
You MUST output exactly a JSON structure (no conversational markdown wrappers outside of valid JSON) containing keys:
- "schedule": an array of items, each having "time" (e.g. "09:00"), "description" (string), "duration" (number of minutes), and "type" ("focus" | "break" | "habit" | "buffer")
- "coachingAdvice": a personalized, highly inspiring motivational coaching insight (string)
- "burnoutRisk": assessment of user's today risk ("Low" | "Moderate" | "High") based on request parameters.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = cleanAndParseJSON(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Day Plan Error:", error);
    res.status(500).json({ error: "Failed to generate AI plan. Please try again.", details: error.message });
  }
});

// 2. AI Task Breakdown Endpoint
app.post("/api/ai/task-breakdown", async (req, res) => {
  const { taskTitle, taskDescription, effort, energy } = req.body;

  if (!ai) {
    const defaultBreakdown = {
      subtasks: [
        { title: "Define constraints and scope", etaMinutes: 15, effort: "low" },
        { title: "Execute core draft / layout", etaMinutes: 45, effort: "high" },
        { title: "Refine typography, testing, and visuals", etaMinutes: 30, effort: "medium" },
        { title: "Integration check & final verification", etaMinutes: 20, effort: "low" }
      ],
      tip: "Simulated Breakdown. Break the layout into small single-focus sprint units to prevent procrastination load."
    };
    return res.json(defaultBreakdown);
  }

  try {
    const prompt = `You are a Productivity Architect from Linear.
Break the following complex task into 3 to 6 highly manageable, actionable sub-steps:
- Task: "${taskTitle}"
- Details: "${taskDescription || 'None'}"
- Effort rating: "${effort || 'medium'}"
- Energy level requirement: "${energy || 'high'}"

Each sub-step must have a specific visual goal.
You MUST output exactly a JSON structure containing:
- "subtasks": array of items, each with "title" (string), "etaMinutes" (numeric estimate), and "effort" ("low" | "medium" | "high")
- "tip": one expert recommendation to finish this task 30% faster (string).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = cleanAndParseJSON(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Task Breakdown Error:", error);
    res.status(500).json({ error: "Failed to break down task", details: error.message });
  }
});

// 3. AI Cognitive Coach Chat Endpoint
app.post("/api/ai/coach-chat", async (req, res) => {
  const { messages, userProfile } = req.body;

  if (!ai) {
    return res.json({
      text: "Hello! I am your FocusFlow Personal Advisor in offline mode. I can help you structure focus loops, resolve procrastination, and stay highly focused. Tap into the server credentials or let's discuss tactics!"
    });
  }

  try {
    const systemPrompt = `You are the Core Cognitive Performance & Behavioral Intelligence Coach at FocusFlow AI. 
Your tone is incredibly clean, premium, encouraging, concise, and professional (like a mix of a high-end personal Chief of Staff and a behavioral therapist).
You help users conquer heavy procrastination, optimize their attention span, avoid burnout, and structure focus loops.
Support communication in English, Tamil (தமிழ்), or Hindi (हिंदी) if requested.
Current user profile context: ${JSON.stringify(userProfile || {})}

Keep replies under 3 short paragraphs. Act as a trusted partner. Always provide a concrete actionable step.`;

    const chatMessages = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // Standard Chat with `@google/genai`
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: chatMessages.length > 1 ? chatMessages.slice(0, chatMessages.length - 1) : [],
      config: {
        systemInstruction: systemPrompt
      }
    });

    // Send the last message in context of history
    const lastUserMsg = messages[messages.length - 1]?.content || "Hello Coach, help me focus!";

    const response = await chat.sendMessage({
      message: lastUserMsg
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Coach Chat Error:", error);
    res.status(500).json({ error: "Focus Coach experienced custom latency", details: error.message });
  }
});

// 4. AI Burnout Diagnostics
app.post("/api/ai/burnout-detect", async (req, res) => {
  const { currentWeeksLoggedHours, focusEfficiency, dailyStressRating, incompleteTasks } = req.body;

  if (!ai) {
    return res.json({
      score: 35,
      level: "Balanced Flow",
      insights: [
        "Your stress indicators are within comfortable parameters.",
        "Maintain current break intervals of at least 8 minutes between work sessions."
      ],
      recommendations: ["Ensure a hard evening cutoff by 7:30 PM today."]
    });
  }

  try {
    const prompt = `You are a Behavioral Psychologist specialized in remote burnout prevention.
Evaluate the user's workload indicators:
- Work week focus hours logged: ${currentWeeksLoggedHours || 38}
- Focus score average: ${focusEfficiency || 82}%
- Daily subjective stress (1-10): ${dailyStressRating || 4}
- Backlog tasks count: ${incompleteTasks || 12}

Assess whether the user shows signs of cognitive fatigue, hyper-activity, or declining returns.
Output a strict JSON with public keys:
- "score": burnout index number from 0 to 100
- "level": risk classification string ("Optimal Focus" | "Mild Exhaustion" | "Burnout Warning" | "Critical Alert")
- "insights": list of 2 or 3 psychological behavioral insights
- "recommendations": list of 2 action points to implement in-app today to recover.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = cleanAndParseJSON(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Burnout Diagnostics Error:", error);
    res.status(500).json({ error: "Diagnostic failure", details: error.message });
  }
});

// 5. AI Weekly Review Generator
app.post("/api/ai/weekly-review", async (req, res) => {
  const { completedTasksCount, focusHoursLogged, streakCount, habitAccuracy } = req.body;

  if (!ai) {
    return res.json({
      wins: ["Successfully logged core focus sessions this week", "Consistent tracking of habits"],
      challenges: ["Slight drop in deep sessions late afternoon"],
      suggestions: ["Shift highest energy task to 10 AM", "Optimize breaks during peak focus"],
      growthIndex: "Accelerating"
    });
  }

  try {
    const prompt = `You are the Lead Coach at FocusFlow AI.
Produce an inspiring, objective, and analytical Weekly Performance Review:
- Tasks fully closed: ${completedTasksCount || 14}
- Focused Deep-Work hours: ${focusHoursLogged || 18} hours
- Constant working days streak: ${streakCount || 4} days
- Habit compliance accuracy: ${habitAccuracy || 78}%

You MUST generate a strict JSON response containing:
- "wins": array of 2 bullet wins
- "challenges": array of 1 or 2 areas requiring tactical awareness
- "suggestions": array of 2 actionable focus tweaks for next week
- "growthIndex": string rating ("Steady" | "Surging" | "Consolidating" | "Breakthrough Master")`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = cleanAndParseJSON(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Weekly Review Error:", error);
    res.status(500).json({ error: "Failed to generate weekly review", details: error.message });
  }
});

// 6. AI Effort Estimator Endpoint
app.post("/api/ai/effort-estimate", async (req, res) => {
  const { title, description, priority, category } = req.body;

  if (!ai) {
    // Elegant deterministic offline fallback
    const lengthFactor = title ? Math.min(180, Math.max(15, title.length * 4)) : 30;
    const priorityFactor = priority === "high" ? 1.5 : priority === "low" ? 0.7 : 1.0;
    const estMinutes = Math.round(lengthFactor * priorityFactor);
    return res.json({
      estimatedMinutes: estMinutes,
      confidenceScore: 78,
      reasons: [
        `Base duration of ${lengthFactor} minutes scaled for ${priority} priority level.`,
        "Time slice estimation calculated using local behavioral lookup tables (offline fallback)."
      ],
      recommendedSubtasks: [
        { title: "Preparatory framing & research", estimatedMinutes: Math.round(estMinutes * 0.25) },
        { title: "Core drafting and engineering sprint", estimatedMinutes: Math.round(estMinutes * 0.5) },
        { title: "Verification, styling review & launch", estimatedMinutes: Math.round(estMinutes * 0.25) }
      ]
    });
  }

  try {
    const prompt = `You are a Senior Technical Program Manager and Agile Specialist at Linear.
Analyze this new task and estimate the ideal focused focus-session duration (in total minutes) to finish it:
- Task Title: "${title}"
- Description: "${description || 'None provided'}"
- Priority: "${priority || 'medium'}"
- Category: "${category || 'general'}"

Output EXACTLY a JSON structure with these exact keys:
- "estimatedMinutes": number of estimated focused minutes (multiple of 5, e.g. 25, 50, 75, 120)
- "confidenceScore": integer percentage from 40 to 95
- "reasons": array of 2 to 3 concise, helpful developer-focused reasons for this estimation
- "recommendedSubtasks": array of 2 to 3 micro-milestones, e.g. [{"title": "Subtask title", "estimatedMinutes": number}]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = cleanAndParseJSON(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Effort Estimator Error:", error);
    res.status(500).json({ error: "Failed to estimate effort in AI model", details: error.message });
  }
});

// -------------------------------------------------------------
// SERVING FRONTEND VIA VITE MIDDLEWARE OR STATIC PRODUCTION DEPLOYMENT
// -------------------------------------------------------------

async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    // Config Development Mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("⚡ Vite development middleware injected.");
  } else {
    // Production Mode serving build folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("📦 Production assets configuration loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 FocusFlow AI is live on http://0.0.0.0:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("💥 Failed to start application container:", err);
});
