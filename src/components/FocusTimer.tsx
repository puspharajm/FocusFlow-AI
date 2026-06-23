import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Sparkles, BookOpen, AlertTriangle } from "lucide-react";
import { Task, FocusSession } from "../types";

interface FocusTimerProps {
  tasks: Task[];
  selectedTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onSessionLogged: (session: FocusSession) => void;
  onXpEarned: (amount: number) => void;
  onAlert: (message: string, type?: "success" | "info" | "warning") => void;
}

export default function FocusTimer({ tasks, selectedTask, onSelectTask, onSessionLogged, onXpEarned, onAlert }: FocusTimerProps) {
  const [duration, setDuration] = useState(38); // minutes
  const [timeLeft, setTimeLeft] = useState(38 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState<"focus" | "break">("focus");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Ambient Sound Synth State
  const [ambientSounds, setAmbientSounds] = useState<Record<string, { active: boolean; volume: number }>>({
    binaural: { active: false, volume: 50 },
    brown: { active: false, volume: 50 },
    rain: { active: false, volume: 50 },
    lounge: { active: false, volume: 50 },
    forest: { active: false, volume: 50 }
  });
  
  // Synth audio nodes references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<Record<string, { gainNode: GainNode; nodes: any[]; interval?: any }>>({});
  const intervalRef = useRef<any>(null);

  // Synchronize timer duration when changing states or slider
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isRunning]);

  // Handle countdown interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerCompilation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, timerType]);

  // Start or synchronize an ambient sound channel
  const syncAmbientSound = (key: string, active: boolean, vol: number) => {
    try {
      const isPlay = active && isRunning;
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (isPlay) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtxClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }

        let channel = activeNodesRef.current[key];
        const baseMultiplier = key === "binaural" ? 0.12 : key === "brown" ? 0.22 : key === "rain" ? 0.18 : key === "lounge" ? 0.04 : 0.08;

        if (!channel) {
          const gainNode = ctx.createGain();
          gainNode.connect(ctx.destination);

          const nodes: any[] = [];
          let intervalId: any = null;

          if (key === "binaural") {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(120, ctx.currentTime);
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(128, ctx.currentTime);
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(150, ctx.currentTime);
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            osc1.start();
            osc2.start();
            nodes.push(osc1, osc2, filter);
          } else if (key === "brown") {
            const bufferSize = ctx.sampleRate * 2;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              output[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = output[i];
              output[i] *= 4.0;
            }
            const source = ctx.createBufferSource();
            source.buffer = noiseBuffer;
            source.loop = true;
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = "lowpass";
            lowpass.frequency.setValueAtTime(400, ctx.currentTime);
            source.connect(lowpass);
            lowpass.connect(gainNode);
            source.start();
            nodes.push(source, lowpass);
          } else if (key === "rain") {
            const bufferSize = ctx.sampleRate * 2;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              output[i] = (Math.random() * 2 - 1) * 0.4;
            }
            const source = ctx.createBufferSource();
            source.buffer = noiseBuffer;
            source.loop = true;
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(800, ctx.currentTime);
            const lfo = ctx.createOscillator();
            lfo.type = "sine";
            lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(200, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            source.connect(filter);
            filter.connect(gainNode);
            source.start();
            lfo.start();
            nodes.push(source, filter, lfo, lfoGain);
          } else if (key === "lounge") {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            osc1.type = "triangle";
            osc1.frequency.setValueAtTime(70, ctx.currentTime);
            osc2.type = "sawtooth";
            osc2.frequency.setValueAtTime(140.5, ctx.currentTime);
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(100, ctx.currentTime);
            filter.Q.setValueAtTime(8, ctx.currentTime);
            lfo.type = "sine";
            lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
            lfoGain.gain.setValueAtTime(45, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            osc1.start();
            osc2.start();
            lfo.start();
            nodes.push(osc1, osc2, lfo, filter);
          } else if (key === "forest") {
            const oscWind = ctx.createOscillator();
            const noiseFilter = ctx.createBiquadFilter();
            oscWind.type = "triangle";
            oscWind.frequency.setValueAtTime(55, ctx.currentTime);
            noiseFilter.type = "lowpass";
            noiseFilter.frequency.setValueAtTime(130, ctx.currentTime);
            oscWind.connect(noiseFilter);
            noiseFilter.connect(gainNode);
            oscWind.start();
            nodes.push(oscWind, noiseFilter);

            intervalId = setInterval(() => {
              if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
              const rCtx = audioCtxRef.current;
              const noteOsc = rCtx.createOscillator();
              const noteGain = rCtx.createGain();
              const freqs = [329.63, 392.00, 440.00, 523.25, 587.33];
              const freqIndex = Math.floor(Math.random() * freqs.length);
              noteOsc.type = "sine";
              noteOsc.frequency.setValueAtTime(freqs[freqIndex] + (Math.random() * 4 - 2), rCtx.currentTime);
              noteGain.gain.setValueAtTime(0.0, rCtx.currentTime);
              noteGain.gain.linearRampToValueAtTime((vol / 100) * 0.05, rCtx.currentTime + 0.05);
              noteGain.gain.exponentialRampToValueAtTime(0.0001, rCtx.currentTime + 1.2);
              noteOsc.connect(noteGain);
              noteGain.connect(rCtx.destination);
              noteOsc.start();
              setTimeout(() => {
                try {
                  noteOsc.stop();
                  noteOsc.disconnect();
                } catch (e) {}
              }, 1500);
            }, 1800);
          }

          gainNode.gain.setValueAtTime((vol / 100) * baseMultiplier, ctx.currentTime);
          activeNodesRef.current[key] = { gainNode, nodes, interval: intervalId };
        } else {
          channel.gainNode.gain.setValueAtTime((vol / 100) * baseMultiplier, ctx.currentTime);
        }
      } else {
        const channel = activeNodesRef.current[key];
        if (channel) {
          if (channel.interval) clearInterval(channel.interval);
          channel.nodes.forEach((nd) => {
            try { nd.stop(); } catch (e) {}
            try { nd.disconnect(); } catch (e) {}
          });
          try { channel.gainNode.disconnect(); } catch (e) {}
          delete activeNodesRef.current[key];
        }
      }
    } catch (e) {
      console.warn("Sound sync error:", e);
    }
  };

  // Synchronize audio ref whenever ambient choices or running toggles
  useEffect(() => {
    Object.keys(ambientSounds).forEach((key) => {
      const channel = ambientSounds[key];
      syncAmbientSound(key, channel.active, channel.volume);
    });
    return () => {
      Object.keys(activeNodesRef.current).forEach((key) => {
        const channel = activeNodesRef.current[key];
        if (channel) {
          if (channel.interval) clearInterval(channel.interval);
          channel.nodes.forEach((nd) => {
            try { nd.stop(); } catch (e) {}
            try { nd.disconnect(); } catch (e) {}
          });
          try { channel.gainNode.disconnect(); } catch (e) {}
        }
      });
      activeNodesRef.current = {};
    };
  }, [ambientSounds, isRunning]);

  // Complete session successfully
  const handleTimerCompilation = () => {
    setIsRunning(false);
    // Explicitly shut down all channels on complete
    Object.keys(activeNodesRef.current).forEach((key) => {
      const channel = activeNodesRef.current[key];
      if (channel) {
        if (channel.interval) clearInterval(channel.interval);
        channel.nodes.forEach((nd) => {
          try { nd.stop(); } catch (e) {}
          try { nd.disconnect(); } catch (e) {}
        });
        try { channel.gainNode.disconnect(); } catch (e) {}
      }
    });
    activeNodesRef.current = {};

    const xpReward = timerType === "focus" ? duration * 10 : 25;
    onXpEarned(xpReward);

    if (timerType === "focus") {
      const loggedSession: FocusSession = {
        id: "session-" + Date.now(),
        timestamp: new Date().toISOString(),
        taskTitle: selectedTask ? selectedTask.title : "Unassigned Deep Work Focus Session",
        durationMinutes: duration,
        breakMinutes: Math.round(duration * 0.2),
        efficiencyScore: selectedTask ? 95 : 88,
        stressRatingAfter: 3
      };
      onSessionLogged(loggedSession);
      
      // Pivot to break block
      setTimerType("break");
      setDuration(Math.max(5, Math.round(duration * 0.2)));
      onAlert(`🎉 Exceptional Session Completed! You earned +${xpReward} XP. Time for a well-deserved recovery break!`, "success");
    } else {
      setTimerType("focus");
      setDuration(38); // Reset to standard focus
      onAlert(`💪 Break Completed! Ready to configure your next Attention Block.`, "success");
    }
  };

  // Quick Calibration Setters
  const calibrateAI = (focusMins: number) => {
    setTimerType("focus");
    setDuration(focusMins);
    setIsRunning(false);
  };

  // Convert seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const percentLeft = (timeLeft / (duration * 60)) * 100;
  // SVG Stroke Settings
  const radius = 85;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentLeft / 100) * circumference;

  return (
    <div className={`relative transition-all duration-500 ${
      isFullscreen 
        ? "fixed inset-0 z-50 bg-[#0B1220] text-white p-8 flex flex-col justify-between" 
        : "bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm"
    }`}>
      
      {/* Header for Timer */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className={`font-semibold ${isFullscreen ? "text-xl text-brand-secondary" : "text-sm text-slate-900"}`}>
            {timerType === "focus" ? "AI Deep Work Interval" : "Rest & Recovery Block"}
          </h3>
          <p className="text-xs text-slate-400">
            {timerType === "focus" ? "Stay focused, ambient noise loops will shield you from local spikes." : "Look away from the screen, take 3 deep breaths."}
          </p>
        </div>
        
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium hover:bg-slate-50 transition-all cursor-pointer ${
            isFullscreen ? "border-slate-800 text-slate-400 hover:bg-slate-900" : "border-slate-200 text-slate-500"
          }`}
        >
          {isFullscreen ? "Exit Immersive State" : "Immersive Deep Work"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-4">
        {/* Main Countdown SVG Indicator (Col-7) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center relative">
          <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="w-full h-full -rotate-90">
              {/* Grid outline back ring */}
              <circle
                className={isFullscreen ? "stroke-slate-850" : "stroke-slate-100"}
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="50%"
                cy="50%"
              />
              <circle
                className={`transition-all duration-100 ${
                  timerType === "focus" ? "stroke-brand-primary" : "stroke-brand-success"
                }`}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="50%"
                cy="50%"
              />
            </svg>

            {/* Inner text values */}
            <div className="absolute text-center">
              <span className={`block font-mono font-bold tracking-tight ${isFullscreen ? "text-6xl" : "text-5xl text-slate-950"}`}>
                {formatTime(timeLeft)}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                timerType === "focus" ? "bg-red-50 text-brand-primary" : "bg-emerald-50 text-brand-success font-medium"
              }`}>
                {timerType === "focus" ? "Focusing" : "Resting"}
              </span>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-4 rounded-full text-white shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all text-lg cursor-pointer ${
                isRunning 
                  ? "bg-slate-800 hover:bg-slate-900" 
                  : timerType === "focus" ? "bg-brand-primary" : "bg-brand-success"
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(duration * 60);
              }}
              title="Reset current interval"
              className={`p-4 rounded-full border hover:bg-slate-50 transition-all cursor-pointer ${
                isFullscreen ? "border-slate-800 text-slate-300 hover:bg-slate-900" : "border-slate-200 text-slate-500"
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configurations panel (Col-5) */}
        <div className="md:col-span-5 space-y-6">
          {/* Active focus task mapping */}
          <div>
            <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${
              isFullscreen ? "text-slate-400" : "text-slate-500"
            }`}>
              Currently Calibrating task
            </label>
            <select
              value={selectedTask?.id || ""}
              onChange={(e) => {
                const found = tasks.find(t => t.id === e.target.value);
                onSelectTask(found || null);
              }}
              className={`w-full text-sm border focus:outline-none focus:ring-1 focus:ring-brand-primary rounded-xl px-3 py-2.5 ${
                isFullscreen 
                  ? "bg-slate-950/60 border-slate-800 text-white" 
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="">-- General Cognitive Focus Session --</option>
              {tasks.filter(t => t.status !== "done").map((t) => (
                <option key={t.id} value={t.id}>
                  ({t.priority.toUpperCase()}) {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* AI duration Presets */}
          <div>
            <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${
              isFullscreen ? "text-slate-400" : "text-slate-500"
            }`}>
              Attention Calibrations
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => calibrateAI(38)}
                className={`p-2.5 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                  duration === 38 
                    ? "bg-gradient-to-br from-brand-primary/10 to-brand-secondary/5 border-brand-primary" 
                    : isFullscreen ? "bg-slate-950/40 border-slate-800 hover:bg-slate-900" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${
                  duration === 38 ? "text-brand-primary" : "text-slate-400"
                } flex items-center gap-1`}>
                  <Sparkles className="w-3" /> AI RECOMMENDED
                </span>
                <span className="text-xl font-mono font-bold mt-1.5">38:08</span>
                <span className="text-[10px] text-slate-400">Circadian optimization</span>
              </button>

              <button
                type="button"
                onClick={() => calibrateAI(25)}
                className={`p-2.5 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                  duration === 25 
                    ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500" 
                    : isFullscreen ? "bg-slate-950/40 border-slate-800 hover:bg-slate-900" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="text-[10px] font-mono text-slate-400 uppercase">CLASSIC</span>
                <span className="text-xl font-mono font-bold mt-1.5">25:05</span>
                <span className="text-[10px] text-slate-400">Pomodoro template</span>
              </button>
            </div>
          </div>

          {/* Synthesizer Selector (Ambient Sound Mixer) */}
          <div>
            <label className={`block text-xs uppercase font-semibold tracking-wider mb-2 ${
              isFullscreen ? "text-slate-400" : "text-slate-500"
            }`}>
              Generative Ambient Soundscape Mixer {Object.values(ambientSounds).some((s: any) => s.active) && isRunning ? "🔊 Playing" : "🔇"}
            </label>
            <div className="space-y-3">
              {[
                { key: "binaural", name: "Binaural Beats", desc: "10Hz Alpha Focus Pulses" },
                { key: "brown", name: "Deep Brown Noise", desc: "Sub-bass Concentration" },
                { key: "rain", name: "Gentle Rainfall", desc: "Static low-pass storm" },
                { key: "lounge", name: "Galaxy Lounge", desc: "Warm Modulating Swells" },
                { key: "forest", name: "Forest Drippings", desc: "Organic Synth Winds" }
              ].map((s) => {
                const isSoundActive = ambientSounds[s.key]?.active;
                const soundVolume = ambientSounds[s.key]?.volume ?? 50;

                return (
                  <div key={s.key} className={`p-3 rounded-2xl border transition-all ${
                    isSoundActive 
                      ? "border-brand-primary bg-brand-primary/5 shadow-sm" 
                      : isFullscreen 
                        ? "bg-slate-950/40 border-slate-850" 
                        : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-semibold ${isFullscreen ? "text-slate-200" : "text-slate-850"}`}>{s.name}</p>
                        <span className="text-[10px] text-slate-400 opacity-80">{s.desc}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAmbientSounds((prev) => ({
                          ...prev,
                          [s.key]: { ...prev[s.key], active: !isSoundActive }
                        }))}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                          isSoundActive
                            ? "bg-brand-primary border-brand-primary text-white"
                            : isFullscreen
                              ? "border-slate-800 hover:border-slate-700 text-slate-400"
                              : "border-slate-300 hover:border-slate-400 text-slate-600 bg-white"
                        }`}
                      >
                        {isSoundActive ? "Active" : "Disabled"}
                      </button>
                    </div>

                    {isSoundActive && (
                      <div className="mt-2 text-[10px] font-mono flex items-center gap-3">
                        <span className="text-slate-400">Volume</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={soundVolume}
                          onChange={(e) => {
                            const newVolume = Number(e.target.value);
                            setAmbientSounds((prev) => ({
                              ...prev,
                              [s.key]: { ...prev[s.key], volume: newVolume }
                            }));
                          }}
                          className="flex-1 accent-brand-primary cursor-pointer h-1.5 bg-slate-200 rounded-lg outline-none"
                        />
                        <span className="text-brand-primary font-bold w-8 text-right">{soundVolume}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!isRunning && Object.values(ambientSounds).some((s: any) => s.active) && (
              <p className="text-[10px] text-brand-primary mt-2.5 flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3" /> Start timer to activate selected soundscapes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
