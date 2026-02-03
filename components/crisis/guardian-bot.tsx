"use client";

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Power,
  Play,
  Pause,
  Settings2,
  Terminal,
  Activity,
  Shield,
  Zap,
  Eye,
  MapPin,
  Satellite,
  ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Database,
  Globe,
  Cpu,
  Cloud,
  Server,
  X,
} from "lucide-react";

// Types
type BotMode = "aggressive" | "standard" | "conservative";
type BotStatus = "active" | "paused" | "processing";

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: "info" | "success" | "warning" | "error" | "processing";
  source?: string;
}

interface PipelineStage {
  name: string;
  status: "idle" | "processing" | "complete" | "error";
  confidence?: number;
}

interface BotMetrics {
  processedPerHour: number;
  accuracyRate: number;
  costSaved: number;
  totalProcessed: number;
  autoPublished: number;
  queuedForReview: number;
  hidden: number;
}

// Free stack services
const FREE_STACK = [
  { name: "LLaVA", description: "Local AI", icon: Cpu, color: "text-green-400" },
  { name: "Hugging Face", description: "Cloud Fallback", icon: Cloud, color: "text-yellow-400" },
  { name: "NASA FIRMS", description: "Satellite", icon: Satellite, color: "text-blue-400" },
  { name: "OpenStreetMap", description: "Geocoding", icon: MapPin, color: "text-cyan-400" },
  { name: "Vercel Hobby", description: "Hosting", icon: Server, color: "text-purple-400" },
  { name: "Supabase", description: "Database", icon: Database, color: "text-emerald-400" },
];

// Simulated Telegram channels
const TELEGRAM_CHANNELS = [
  "Gaza_Updates_Official",
  "Emergency_Alert_ME",
  "Medical_Aid_Network",
  "Civilian_Protection",
  "Crisis_Reports_Live",
];

// Crisis keywords
const CRISIS_KEYWORDS = ["bombing", "evacuation", "medical", "emergency", "injured", "shelter", "attack", "fire", "explosion"];

// Pipeline stages
const PIPELINE_STAGES = [
  { name: "Scraping", icon: Terminal },
  { name: "AI Verification", icon: Eye },
  { name: "Image Check", icon: ImageIcon },
  { name: "Satellite Cross-Ref", icon: Satellite },
  { name: "Geolocation", icon: MapPin },
  { name: "Auto-Action", icon: Zap },
];

interface GuardianBotProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentVerified?: (incident: { title: string; confidence: number }) => void;
}

export function GuardianBot({ isOpen, onClose, onIncidentVerified }: GuardianBotProps) {
  const [botStatus, setBotStatus] = useState<BotStatus>("paused");
  const [botMode, setBotMode] = useState<BotMode>("standard");
  const [sensitivity, setSensitivity] = useState(70);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<BotMetrics>({
    processedPerHour: 0,
    accuracyRate: 94.7,
    costSaved: 0,
    totalProcessed: 0,
    autoPublished: 0,
    queuedForReview: 0,
    hidden: 0,
  });
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(
    PIPELINE_STAGES.map((s) => ({ name: s.name, status: "idle" }))
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  // Get threshold based on mode
  const getThreshold = useCallback(() => {
    switch (botMode) {
      case "aggressive":
        return 60;
      case "conservative":
        return 90;
      default:
        return sensitivity;
    }
  }, [botMode, sensitivity]);

  // Add log entry
  const addLog = useCallback((message: string, type: LogEntry["type"] = "info", source?: string) => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      message,
      type,
      source,
    };
    setLogs((prev) => [...prev.slice(-100), entry]);
  }, []);

  // Scroll to bottom of logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate pipeline processing
  const runPipeline = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    const channel = TELEGRAM_CHANNELS[currentChannel];
    const keyword = CRISIS_KEYWORDS[Math.floor(Math.random() * CRISIS_KEYWORDS.length)];

    // Stage 1: Scraping
    setPipelineStages((prev) => prev.map((s, i) => (i === 0 ? { ...s, status: "processing" } : s)));
    addLog(`Scraping @${channel}...`, "processing", "MTProto");
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    addLog(`Found message containing "${keyword}" keyword`, "info", channel);
    setPipelineStages((prev) => prev.map((s, i) => (i === 0 ? { ...s, status: "complete" } : s)));

    // Stage 2: AI Verification
    setPipelineStages((prev) => prev.map((s, i) => (i === 1 ? { ...s, status: "processing" } : s)));
    addLog("Connecting to LLaVA (localhost:11434)...", "processing", "Ollama");
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));
    const llavaAvailable = Math.random() > 0.3;
    if (llavaAvailable) {
      addLog("LLaVA analysis: Content appears genuine, no manipulation detected", "success", "LLaVA");
    } else {
      addLog("LLaVA unavailable, falling back to Hugging Face...", "warning", "Ollama");
      await new Promise((r) => setTimeout(r, 400));
      addLog("HF Inference: Content verified via BLIP-2 model", "success", "HuggingFace");
    }
    setPipelineStages((prev) => prev.map((s, i) => (i === 1 ? { ...s, status: "complete", confidence: 85 + Math.random() * 10 } : s)));

    // Stage 3: Image Check
    setPipelineStages((prev) => prev.map((s, i) => (i === 2 ? { ...s, status: "processing" } : s)));
    addLog("Running reverse image search...", "processing", "ImageSearch");
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 300));
    const imageNew = Math.random() > 0.2;
    if (imageNew) {
      addLog("No prior matches found - image appears original", "success", "Yandex+Bing");
    } else {
      addLog("Similar image found from 2 days ago - flagging for review", "warning", "Yandex");
    }
    setPipelineStages((prev) => prev.map((s, i) => (i === 2 ? { ...s, status: "complete", confidence: imageNew ? 90 : 45 } : s)));

    // Stage 4: Satellite Cross-Ref
    setPipelineStages((prev) => prev.map((s, i) => (i === 3 ? { ...s, status: "processing" } : s)));
    addLog("Querying NASA FIRMS API...", "processing", "NASA");
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
    const firmsMatch = Math.random() > 0.4;
    if (firmsMatch) {
      addLog("FIRMS confirms thermal anomaly at coordinates", "success", "NASA-FIRMS");
    } else {
      addLog("No thermal anomaly detected in FIRMS data", "info", "NASA-FIRMS");
    }
    setPipelineStages((prev) => prev.map((s, i) => (i === 3 ? { ...s, status: "complete", confidence: firmsMatch ? 95 : 70 } : s)));

    // Stage 5: Geolocation
    setPipelineStages((prev) => prev.map((s, i) => (i === 4 ? { ...s, status: "processing" } : s)));
    addLog("Verifying location via Nominatim...", "processing", "OSM");
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
    addLog("Location verified: coordinates match reported area", "success", "Nominatim");
    setPipelineStages((prev) => prev.map((s, i) => (i === 4 ? { ...s, status: "complete", confidence: 88 } : s)));

    // Stage 6: Auto-Action
    setPipelineStages((prev) => prev.map((s, i) => (i === 5 ? { ...s, status: "processing" } : s)));
    const overallConfidence = 60 + Math.random() * 35;
    const threshold = getThreshold();

    await new Promise((r) => setTimeout(r, 300));

    if (overallConfidence >= 80) {
      addLog(`AUTO-PUBLISHED: ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} incident verified (${overallConfidence.toFixed(1)}% confidence)`, "success", "AutoAction");
      setMetrics((prev) => ({
        ...prev,
        autoPublished: prev.autoPublished + 1,
        totalProcessed: prev.totalProcessed + 1,
        processedPerHour: prev.processedPerHour + 1,
      }));
      onIncidentVerified?.({ title: `${keyword} incident`, confidence: overallConfidence });
    } else if (overallConfidence >= 40) {
      addLog(`QUEUED FOR REVIEW: Confidence ${overallConfidence.toFixed(1)}% below auto-publish threshold`, "warning", "AutoAction");
      setMetrics((prev) => ({
        ...prev,
        queuedForReview: prev.queuedForReview + 1,
        totalProcessed: prev.totalProcessed + 1,
        processedPerHour: prev.processedPerHour + 1,
      }));
    } else {
      addLog(`HIDDEN: Low confidence ${overallConfidence.toFixed(1)}% - likely false positive`, "error", "AutoAction");
      setMetrics((prev) => ({
        ...prev,
        hidden: prev.hidden + 1,
        totalProcessed: prev.totalProcessed + 1,
        processedPerHour: prev.processedPerHour + 1,
      }));
    }

    setPipelineStages((prev) => prev.map((s, i) => (i === 5 ? { ...s, status: "complete", confidence: overallConfidence } : s)));

    // Reset pipeline after delay
    await new Promise((r) => setTimeout(r, 1500));
    setPipelineStages(PIPELINE_STAGES.map((s) => ({ name: s.name, status: "idle" })));
    setCurrentChannel((prev) => (prev + 1) % TELEGRAM_CHANNELS.length);
    processingRef.current = false;
  }, [addLog, currentChannel, getThreshold, onIncidentVerified]);

  // Auto-run pipeline when active
  useEffect(() => {
    if (botStatus !== "active") return;

    const interval = setInterval(() => {
      if (!processingRef.current) {
        runPipeline();
      }
    }, 5000 + Math.random() * 3000);

    // Run immediately on start
    if (!processingRef.current) {
      runPipeline();
    }

    return () => clearInterval(interval);
  }, [botStatus, runPipeline]);

  // Reset metrics per hour
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({ ...prev, processedPerHour: 0 }));
    }, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Initial log
  useEffect(() => {
    addLog("Guardian Bot initialized", "info", "System");
    addLog("Free tier stack loaded: LLaVA, HuggingFace, NASA FIRMS, OSM", "success", "System");
  }, [addLog]);

  const toggleBot = () => {
    if (botStatus === "active") {
      setBotStatus("paused");
      addLog("Bot paused by operator", "warning", "System");
    } else {
      setBotStatus("active");
      addLog("Bot activated - beginning autonomous monitoring", "success", "System");
    }
  };

  const runTestMode = () => {
    if (botStatus === "active") {
      addLog("Cannot run test while bot is active", "error", "System");
      return;
    }
    addLog("=== TEST MODE INITIATED ===", "info", "System");
    runPipeline();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl border border-green-500/30 bg-black/95 shadow-2xl shadow-green-500/10">
        {/* 100% Free Stack Banner */}
        <div className="bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-cyan-600/20 border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-mono text-sm font-bold tracking-wider">100% FREE STACK</span>
            <span className="text-green-400/60 font-mono text-xs">| Zero API Costs | Open Source AI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Header */}
        <div className="border-b border-green-500/30 bg-black/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "relative h-12 w-12 rounded-lg flex items-center justify-center",
                botStatus === "active" ? "bg-green-500/20 border border-green-500/50" : "bg-gray-800 border border-gray-700"
              )}>
                <Bot className={cn("h-6 w-6", botStatus === "active" ? "text-green-400" : "text-gray-500")} />
                {botStatus === "active" && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-400 font-mono tracking-wide">GUARDIAN AUTONOMOUS BOT</h2>
                <p className="text-green-400/60 text-sm font-mono">Autonomous Verification System v1.0</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <select
                value={botMode}
                onChange={(e) => setBotMode(e.target.value as BotMode)}
                className="bg-black border border-green-500/30 text-green-400 font-mono text-sm px-3 py-2 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="aggressive">AGGRESSIVE (60%)</option>
                <option value="standard">STANDARD (70%)</option>
                <option value="conservative">CONSERVATIVE (90%)</option>
              </select>

              <Button
                onClick={toggleBot}
                className={cn(
                  "min-h-[44px] font-mono font-bold tracking-wider",
                  botStatus === "active"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-black"
                )}
              >
                {botStatus === "active" ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    PAUSE
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    ACTIVATE
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Left Column: Pipeline & Stack */}
          <div className="space-y-4">
            {/* Pipeline Status */}
            <div className="border border-green-500/30 rounded-lg bg-black/50 p-4">
              <h3 className="text-green-400 font-mono font-bold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                VERIFICATION PIPELINE
              </h3>
              <div className="space-y-2">
                {PIPELINE_STAGES.map((stage, i) => {
                  const Icon = stage.icon;
                  const pipelineStage = pipelineStages[i];
                  return (
                    <div
                      key={stage.name}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded border transition-all",
                        pipelineStage.status === "processing" && "border-yellow-500/50 bg-yellow-500/10",
                        pipelineStage.status === "complete" && "border-green-500/50 bg-green-500/10",
                        pipelineStage.status === "error" && "border-red-500/50 bg-red-500/10",
                        pipelineStage.status === "idle" && "border-gray-700 bg-gray-900/50"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4",
                        pipelineStage.status === "processing" && "text-yellow-400 animate-pulse",
                        pipelineStage.status === "complete" && "text-green-400",
                        pipelineStage.status === "error" && "text-red-400",
                        pipelineStage.status === "idle" && "text-gray-600"
                      )} />
                      <span className={cn(
                        "font-mono text-sm flex-1",
                        pipelineStage.status === "idle" ? "text-gray-600" : "text-green-400"
                      )}>
                        {stage.name}
                      </span>
                      {pipelineStage.status === "processing" && (
                        <RefreshCw className="h-3 w-3 text-yellow-400 animate-spin" />
                      )}
                      {pipelineStage.status === "complete" && pipelineStage.confidence && (
                        <span className="text-xs font-mono text-green-400">{pipelineStage.confidence.toFixed(0)}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Free Stack Badges */}
            <div className="border border-green-500/30 rounded-lg bg-black/50 p-4">
              <h3 className="text-green-400 font-mono font-bold mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                FREE STACK
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {FREE_STACK.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.name}
                      className="flex items-center gap-2 px-2 py-1.5 rounded border border-green-500/20 bg-green-500/5"
                    >
                      <Icon className={cn("h-3 w-3", service.color)} />
                      <div className="overflow-hidden">
                        <div className="text-green-400 font-mono text-xs font-bold truncate">{service.name}</div>
                        <div className="text-green-400/50 font-mono text-[10px] truncate">{service.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="border border-green-500/30 rounded-lg bg-black/50 p-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-green-400 font-mono font-bold mb-3"
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  CONTROLS
                </span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvanced && (
                <div className="space-y-3">
                  {/* Sensitivity Slider */}
                  <div>
                    <label className="text-green-400/70 font-mono text-xs block mb-2">
                      SENSITIVITY: {sensitivity}%
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="95"
                      value={sensitivity}
                      onChange={(e) => setSensitivity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                      disabled={botMode !== "standard"}
                    />
                    <div className="flex justify-between text-[10px] font-mono text-green-400/50 mt-1">
                      <span>AGGRESSIVE</span>
                      <span>CONSERVATIVE</span>
                    </div>
                  </div>

                  {/* Manual Override Buttons */}
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={runTestMode}
                      disabled={botStatus === "active"}
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs bg-transparent"
                    >
                      <Play className="h-3 w-3 mr-2" />
                      TEST MODE
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-mono text-xs bg-transparent"
                      onClick={() => addLog("Force verify triggered - bypassing confidence threshold", "warning", "Manual")}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-2" />
                      FORCE VERIFY
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-mono text-xs bg-transparent"
                      onClick={() => addLog(`Blacklisted source: @${TELEGRAM_CHANNELS[currentChannel]}`, "error", "Manual")}
                    >
                      <XCircle className="h-3 w-3 mr-2" />
                      BLACKLIST SOURCE
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Column: Activity Log */}
          <div className="lg:col-span-1 border border-green-500/30 rounded-lg bg-black/80 flex flex-col min-h-[400px]">
            <div className="border-b border-green-500/30 px-4 py-2 flex items-center justify-between bg-green-500/5">
              <h3 className="text-green-400 font-mono font-bold flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                ACTIVITY LOG
              </h3>
              <span className="text-green-400/50 font-mono text-xs">
                {logs.length} entries
              </span>
            </div>
            <div
              ref={logContainerRef}
              className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1"
              style={{ maxHeight: "400px" }}
            >
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-green-400/40 shrink-0">
                    [{log.timestamp.toLocaleTimeString("en-US", { hour12: false })}]
                  </span>
                  {log.source && (
                    <span className="text-cyan-400/70 shrink-0">[{log.source}]</span>
                  )}
                  <span className={cn(
                    log.type === "success" && "text-green-400",
                    log.type === "warning" && "text-yellow-400",
                    log.type === "error" && "text-red-400",
                    log.type === "processing" && "text-cyan-400",
                    log.type === "info" && "text-green-400/70"
                  )}>
                    {log.message}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-green-400/30 text-center py-8">
                  Waiting for activity...
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metrics */}
          <div className="space-y-4">
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Processed/Hour"
                value={metrics.processedPerHour.toString()}
                icon={Clock}
                color="cyan"
              />
              <MetricCard
                label="Accuracy Rate"
                value={`${metrics.accuracyRate.toFixed(1)}%`}
                icon={CheckCircle2}
                color="green"
              />
              <MetricCard
                label="Cost Saved"
                value="$0.00"
                icon={Zap}
                color="yellow"
              />
              <MetricCard
                label="Total Processed"
                value={metrics.totalProcessed.toString()}
                icon={Activity}
                color="purple"
              />
            </div>

            {/* Action Breakdown */}
            <div className="border border-green-500/30 rounded-lg bg-black/50 p-4">
              <h3 className="text-green-400 font-mono font-bold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                ACTION BREAKDOWN
              </h3>
              <div className="space-y-2">
                <ActionRow label="Auto-Published" value={metrics.autoPublished} icon={CheckCircle2} color="green" />
                <ActionRow label="Queued for Review" value={metrics.queuedForReview} icon={Clock} color="yellow" />
                <ActionRow label="Hidden" value={metrics.hidden} icon={XCircle} color="red" />
              </div>
            </div>

            {/* Monitoring Status */}
            <div className="border border-green-500/30 rounded-lg bg-black/50 p-4">
              <h3 className="text-green-400 font-mono font-bold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                MONITORING
              </h3>
              <div className="space-y-2">
                {TELEGRAM_CHANNELS.map((channel, i) => (
                  <div
                    key={channel}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded font-mono text-xs",
                      i === currentChannel && botStatus === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "text-green-400/50"
                    )}
                  >
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      i === currentChannel && botStatus === "active" ? "bg-green-500 animate-pulse" : "bg-gray-700"
                    )} />
                    @{channel}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  const colorClasses = {
    cyan: "border-cyan-500/30 text-cyan-400",
    green: "border-green-500/30 text-green-400",
    yellow: "border-yellow-500/30 text-yellow-400",
    purple: "border-purple-500/30 text-purple-400",
  };

  return (
    <div className={cn("border rounded-lg bg-black/50 p-3", colorClasses[color as keyof typeof colorClasses])}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3 w-3" />
        <span className="font-mono text-[10px] uppercase opacity-70">{label}</span>
      </div>
      <div className="font-mono text-2xl font-bold">{value}</div>
    </div>
  );
}

// Action Row Component
function ActionRow({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const colorClasses = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  };

  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded bg-gray-900/50">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3 w-3", colorClasses[color as keyof typeof colorClasses])} />
        <span className="font-mono text-xs text-green-400/70">{label}</span>
      </div>
      <span className={cn("font-mono text-sm font-bold", colorClasses[color as keyof typeof colorClasses])}>
        {value}
      </span>
    </div>
  );
}
