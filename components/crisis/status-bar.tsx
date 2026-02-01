"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { NetworkStats } from "@/lib/types";
import {
  Wifi,
  WifiOff,
  Radio,
  Battery,
  Signal,
  RefreshCw,
  Globe,
  Zap,
} from "lucide-react";

interface StatusBarProps {
  networkStats: NetworkStats;
  isOfflineMode?: boolean;
  onToggleOffline?: () => void;
}

export function StatusBar({
  networkStats,
  isOfflineMode = false,
  onToggleOffline,
}: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate battery API
  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as { getBattery: () => Promise<{ level: number }> })
        .getBattery()
        .then((battery) => {
          setBatteryLevel(Math.round(battery.level * 100));
        })
        .catch(() => {});
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatLastSync = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <header className="glass-strong border-b border-border/50">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crisis-warning">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm leading-tight">
                CrisisOS
              </h1>
              <p className="text-muted-foreground text-[10px] leading-tight">
                Civilian Coordination
              </p>
            </div>
          </div>
        </div>

        {/* Center: Network Status */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Connection Mode */}
          <button
            onClick={onToggleOffline}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isOfflineMode
                ? "bg-crisis-warning/20 text-crisis-warning"
                : "bg-crisis-success/20 text-crisis-success"
            )}
          >
            {isOfflineMode ? (
              <>
                <Radio className="h-3.5 w-3.5 pulse-live" />
                Mesh Mode
              </>
            ) : (
              <>
                <Globe className="h-3.5 w-3.5" />
                Online
              </>
            )}
          </button>

          {/* Mesh Nodes */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-3 w-1 rounded-sm",
                    i < Math.ceil(networkStats.onlineNodes / 2)
                      ? "bg-crisis-success"
                      : "bg-muted"
                  )}
                  style={{ height: `${8 + i * 2}px` }}
                />
              ))}
            </div>
            <span className="text-foreground font-mono">
              {networkStats.onlineNodes}/{networkStats.totalNodes}
            </span>
            <span className="text-muted-foreground">nodes</span>
          </div>

          {/* Sync Status */}
          <div className="flex items-center gap-1.5 text-xs">
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                networkStats.syncStatus === "syncing" && "animate-spin",
                networkStats.syncStatus === "synced"
                  ? "text-crisis-success"
                  : networkStats.syncStatus === "syncing"
                    ? "text-crisis-warning"
                    : "text-crisis-critical"
              )}
            />
            <span
              className={cn(
                "font-medium",
                networkStats.syncStatus === "synced"
                  ? "text-crisis-success"
                  : networkStats.syncStatus === "syncing"
                    ? "text-crisis-warning"
                    : "text-crisis-critical"
              )}
            >
              {networkStats.syncStatus === "synced"
                ? "Synced"
                : networkStats.syncStatus === "syncing"
                  ? "Syncing..."
                  : "Offline"}
            </span>
            <span className="text-muted-foreground">
              {formatLastSync(networkStats.lastSync)}
            </span>
          </div>

          {/* Latency */}
          <div className="flex items-center gap-1.5 text-xs">
            <Signal
              className={cn(
                "h-3.5 w-3.5",
                networkStats.avgLatency < 100
                  ? "text-crisis-success"
                  : networkStats.avgLatency < 200
                    ? "text-crisis-warning"
                    : "text-crisis-critical"
              )}
            />
            <span className="text-foreground font-mono">
              {networkStats.avgLatency}ms
            </span>
          </div>
        </div>

        {/* Right: System Status */}
        <div className="flex items-center gap-3">
          {/* Mobile Network Indicator */}
          <div className="flex items-center gap-1 md:hidden">
            {isOfflineMode ? (
              <WifiOff className="h-4 w-4 text-crisis-warning" />
            ) : (
              <Wifi className="h-4 w-4 text-crisis-success" />
            )}
          </div>

          {/* Battery */}
          <div className="flex items-center gap-1 text-xs">
            <Battery
              className={cn(
                "h-4 w-4",
                batteryLevel > 50
                  ? "text-crisis-success"
                  : batteryLevel > 20
                    ? "text-crisis-warning"
                    : "text-crisis-critical"
              )}
            />
            <span className="hidden text-foreground font-mono sm:inline">
              {batteryLevel}%
            </span>
          </div>

          {/* Time */}
          <span className="text-foreground font-mono text-sm">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    </header>
  );
}
