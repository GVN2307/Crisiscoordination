"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  type ConnectionState,
  type QueuedMessage,
  CONNECTION_LABELS,
} from "@/lib/connection-store";
import {
  Globe,
  Radio,
  WifiOff,
  RefreshCw,
  CloudOff,
  Send,
  CheckCircle2,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionStatusBarProps {
  state: ConnectionState;
  peerCount: number;
  queuedMessages: QueuedMessage[];
  isSyncing: boolean;
  onRetrySync?: () => void;
  onDismissQueue?: () => void;
  isSecureMesh?: boolean;
}

export function ConnectionStatusBar({
  state,
  peerCount,
  queuedMessages,
  isSyncing,
  onRetrySync,
  onDismissQueue,
  isSecureMesh = true,
}: ConnectionStatusBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueueToast, setShowQueueToast] = useState(false);
  const [lastQueueCount, setLastQueueCount] = useState(0);

  const config = CONNECTION_LABELS[state];
  const StateIcon = state === "online" ? Globe : state === "mesh" ? Radio : WifiOff;

  // Show toast when new message is queued
  useEffect(() => {
    if (queuedMessages.length > lastQueueCount && state !== "online") {
      setShowQueueToast(true);
      const timer = setTimeout(() => setShowQueueToast(false), 4000);
      return () => clearTimeout(timer);
    }
    setLastQueueCount(queuedMessages.length);
  }, [queuedMessages.length, lastQueueCount, state]);

  const handleTap = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <>
      {/* Main Status Bar */}
      <div
        className={cn(
          "sticky top-0 z-50 border-b transition-colors",
          state === "online" && "border-crisis-success/30 bg-crisis-success/10",
          state === "mesh" && "border-crisis-info/30 bg-crisis-info/10",
          state === "isolated" && "border-crisis-critical/30 bg-crisis-critical/10"
        )}
      >
        <button
          onClick={handleTap}
          className="flex w-full items-center justify-between px-4 py-2 touch-target-lg"
          aria-expanded={isExpanded}
          aria-label={`Connection status: ${config.label}. ${config.description}. Tap to ${isExpanded ? "collapse" : "expand"} details.`}
        >
          {/* Left: Status Indicator */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                state === "online" && "bg-crisis-success/20",
                state === "mesh" && "bg-crisis-info/20",
                state === "isolated" && "bg-crisis-critical/20"
              )}
              aria-hidden="true"
            >
              <StateIcon
                className={cn(
                  "h-4 w-4",
                  state === "online" && "text-crisis-success",
                  state === "mesh" && "text-crisis-info pulse-live",
                  state === "isolated" && "text-crisis-critical"
                )}
              />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-semibold text-sm",
                    state === "online" && "text-crisis-success",
                    state === "mesh" && "text-crisis-info",
                    state === "isolated" && "text-crisis-critical"
                  )}
                >
                  {config.label}
                </span>
                {isSecureMesh && state === "mesh" && (
                  <span className="flex items-center gap-1 rounded-full bg-crisis-info/20 px-2 py-0.5 text-crisis-info text-xs">
                    <Lock className="h-3 w-3" />
                    Secure
                  </span>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {config.description}
              </span>
            </div>
          </div>

          {/* Right: Peer Count & Sync Status */}
          <div className="flex items-center gap-3">
            {state !== "isolated" && (
              <div className="text-right">
                <span className="block font-mono text-foreground text-sm">
                  {peerCount}
                </span>
                <span className="text-muted-foreground text-xs">
                  {state === "online" ? "servers" : "peers"}
                </span>
              </div>
            )}

            {isSyncing && (
              <RefreshCw
                className="h-4 w-4 animate-spin text-crisis-info"
                aria-label="Syncing"
              />
            )}

            {queuedMessages.length > 0 && (
              <div
                className="flex items-center gap-1 rounded-full bg-crisis-warning/20 px-2 py-1"
                role="status"
                aria-live="polite"
              >
                <CloudOff className="h-3 w-3 text-crisis-warning" />
                <span className="font-mono text-crisis-warning text-xs">
                  {queuedMessages.length}
                </span>
              </div>
            )}
          </div>
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-border/30 px-4 py-3">
            {/* Queue Status */}
            {queuedMessages.length > 0 && (
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-foreground text-sm font-medium">
                    Queued Messages
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Will sync when online
                  </span>
                </div>
                <div className="space-y-1.5">
                  {queuedMessages.slice(0, 3).map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Send className="h-3 w-3 text-muted-foreground" />
                        <span className="text-foreground text-xs">
                          {msg.type === "sos"
                            ? "SOS Beacon"
                            : msg.type === "verification"
                              ? "Verification"
                              : "Report"}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-xs",
                          msg.status === "sending" && "text-crisis-warning",
                          msg.status === "failed" && "text-crisis-critical",
                          msg.status === "queued" && "text-muted-foreground"
                        )}
                      >
                        {msg.status}
                      </span>
                    </div>
                  ))}
                  {queuedMessages.length > 3 && (
                    <span className="block text-center text-muted-foreground text-xs">
                      +{queuedMessages.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {state !== "online" && onRetrySync && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetrySync}
                  disabled={isSyncing}
                  className="touch-target-lg flex-1 bg-transparent"
                >
                  <RefreshCw
                    className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")}
                  />
                  {isSyncing ? "Syncing..." : "Retry Sync"}
                </Button>
              )}
              {queuedMessages.length > 0 && onDismissQueue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismissQueue}
                  className="touch-target-lg"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Queue
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Queue Toast */}
      {showQueueToast && (
        <div
          className="fixed left-4 right-4 top-20 z-50 animate-in slide-in-from-top-2 md:left-auto md:right-4 md:w-80"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-lg border border-crisis-warning/30 bg-crisis-warning/10 px-4 py-3 shadow-lg">
            <Send className="h-5 w-5 text-crisis-warning" />
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">
                Message queued for mesh broadcast
              </p>
              <p className="text-muted-foreground text-xs">
                Will send when connection improves
              </p>
            </div>
            <button
              onClick={() => setShowQueueToast(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
