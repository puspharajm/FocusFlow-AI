import { useState } from "react";
import { Sparkles, Send, Bot, User, Brain, AlertTriangle } from "lucide-react";
import { UserProfile } from "../types";

interface AICoachProps {
  profile: UserProfile;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AICoach({ profile }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: `Hello, ${profile.name}! I am your Cognitive Focus Assistant. I maintain continuous awareness over your attention decay windows. What is challenging your performance flow state today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "ta" | "hi">("en");

  // Precursor sample chats
  const presetPills = [
    { label: "My focus is drifting, help!", prompt: "I am having trouble maintaining focus right now. My mind keeps drifting. Guide me through a quick cognitive anchoring exercise." },
    { label: "Help me resolve burnout", prompt: "I feel exhausted yet pressured to perform. How do I balance recovery without feeling guilty about task inertia?" },
    { label: "Structure my afternoon deep-block", prompt: "I have 3 high-energy engineering tasks remaining for the afternoon. Give me an customized focus interval structure to tackle them." }
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content
          })),
          userProfile: {
            ...profile,
            selectedLanguage: language === "ta" ? "Tamil" : language === "hi" ? "Hindi" : "English"
          }
        }),
      });

      if (!response.ok) {
        throw new Error("API Failure");
      }

      const resData = await response.json();
      
      const coachMsg: Message = {
        id: "msg-coach-" + Date.now(),
        role: "assistant",
        content: resData.text || "I apologize. My latency indicators are peaking. Let's calibrate a silent meditation block.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
      
      // Sophisticated offline coaching fallback responses
      let fallbackText = "I see. Let's practice simple box-breathing to recalibrate: Breathe in (4s) ➜ Hold (4s) ➜ Exhale (4s) ➜ Rest (4s). Repeat this three times to lower high cortical stress triggers.";
      if (textToSend.toLowerCase().includes("procrastinat") || textToSend.toLowerCase().includes("drift")) {
        fallbackText = "Procrastination is often an emotional avoidance reaction to task friction rather than bad time management. Tell me: what is the single smallest sub-step we can carve out inside this task to start with? Even 5 minutes count.";
      } else if (textToSend.toLowerCase().includes("burnout") || textToSend.toLowerCase().includes("exhausted")) {
        fallbackText = "Your exhaustion is a valuable biochemical notification. We must secure an evening cutoff window. I recommend scheduling a complete tech break inside the next hour to safeguard sleep cycles.";
      }

      const coachMsg: Message = {
        id: "msg-coach-fallback-" + Date.now(),
        role: "assistant",
        content: `[Standby Mode] ${fallbackText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, coachMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-[600px] justify-between">
      {/* Top Header info */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center text-brand-primary shadow-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">FocusFlow AI Mental Advisor</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full uppercase leading-none">
              ● Online Standby
            </span>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 border border-slate-150 p-1 rounded-xl bg-slate-50">
          {[
            { tag: "en", label: "EN" },
            { tag: "ta", label: "தனி" },
            { tag: "hi", label: "हिन्दी" }
          ].map((l) => (
            <button
              key={l.tag}
              onClick={() => setLanguage(l.tag as any)}
              className={`px-3 py-1 text-[10px] font-bold font-mono rounded-lg transition-all cursor-pointer ${
                language === l.tag
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-[85%] ${
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
              m.role === "user" ? "bg-slate-900 text-white" : "bg-red-50 text-brand-primary border border-red-100"
            }`}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`rounded-2xl p-3.5 space-y-1 ${
              m.role === "user"
                ? "bg-slate-900 text-white rounded-tr-none"
                : "bg-slate-100/80 text-slate-800 rounded-tl-none border border-slate-150/50"
            }`}>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
              <span className={`block text-[8px] font-mono opacity-60 text-right`}>
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-brand-primary border border-red-100 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex gap-1.5 p-3 rounded-2xl bg-slate-100/80 items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Preset Pills and Input Row */}
      <div className="border-t border-slate-100 pt-3 space-y-3">
        {/* Preset selection buttons */}
        <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
          {presetPills.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.prompt)}
              className="text-[10px] bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Sparkles className="w-2.5 h-2.5 text-brand-primary" />
              {p.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="relative flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={loading ? "AI is reviewing your workload metrics..." : "Ask your mental cognitive coach anything in any language..."}
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl pl-4 pr-12 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-800 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputText.trim()}
            className="absolute right-2 top-2 bg-slate-900 border hover:bg-slate-800 disabled:bg-slate-100 text-white disabled:text-slate-400 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
