"use client";

import React from "react"

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { RawMessage } from "@/lib/types";
import { sanitizeText } from "@/lib/security";
import {
  MessageCircle,
  ImageIcon,
  MapPin,
  Clock,
  Loader2,
  AlertTriangle,
  ArrowRight,
  X,
  ChevronLeft,
  Shield,
  ShieldOff,
  Mic,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UnverifiedDrawerProps {
  messages: RawMessage[];
  onProcessMessage?: (id: string) => void;
  onVerifyMessage?: (id: string) => void;
  onFlagMessage?: (id: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnverifiedDrawer({
  messages,
  onProcessMessage,
  onVerifyMessage,
  onFlagMessage,
  isOpen,
  onOpenChange,
}: UnverifiedDrawerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const pullStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Pull to refresh handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPulling(false);
    pullStartY.current = 0;
  }, []);

  // Voice input handler (simulated)
  const handleVoiceInput = useCallback(() => {
    setIsListening((prev) => !prev);
    if (!isListening) {
      // Simulate voice recognition stopping after 5 seconds
      setTimeout(() => setIsListening(false), 5000);
    }
  }, [isListening]);

  const getSourceIcon = (source: "telegram" | "whatsapp") => {
    return source === "telegram" ? (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ) : (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    );
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-full flex-col bg-card border-r border-border transition-transform duration-300 md:relative md:z-auto md:w-[380px] lg:w-[420px]",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        role="complementary"
        aria-label="Unverified message stream"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="pulse-live h-2 w-2 rounded-full bg-crisis-warning" aria-hidden="true" />
            <h2 className="font-semibold text-foreground">Unverified Stream</h2>
            <Badge variant="outline" className="border-crisis-warning/50 text-crisis-warning">
              {messages.length} pending
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              className={cn(
                "touch-target-lg h-10 w-10",
                isListening && "bg-crisis-critical/20 text-crisis-critical"
              )}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              aria-pressed={isListening}
            >
              <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="touch-target-lg h-10 w-10 md:hidden"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Pull to Refresh Indicator */}
        {isPulling && (
          <div className="flex items-center justify-center py-2" aria-live="polite">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground text-xs">Pull to refresh</span>
          </div>
        )}

        {/* Message List */}
        <div
          ref={containerRef}
          className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <SwipeableMessageCard
                key={message.id}
                message={message}
                formatTime={formatTime}
                getSourceIcon={getSourceIcon}
                onProcess={() => onProcessMessage?.(message.id)}
                onVerify={() => onVerifyMessage?.(message.id)}
                onFlag={() => onFlagMessage?.(message.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => onOpenChange(true)}
          className="fixed left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-lg bg-crisis-warning/20 px-2 py-8 transition-colors hover:bg-crisis-warning/30 md:hidden"
          aria-label="Open unverified stream"
        >
          <ChevronLeft className="h-5 w-5 rotate-180 text-crisis-warning" />
        </button>
      )}
    </>
  );
}

// Swipeable Card Component
interface SwipeableMessageCardProps {
  message: RawMessage;
  formatTime: (ts: number) => string;
  getSourceIcon: (source: "telegram" | "whatsapp") => React.ReactNode;
  onProcess: () => void;
  onVerify: () => void;
  onFlag: () => void;
}

function SwipeableMessageCard({
  message,
  formatTime,
  getSourceIcon,
  onProcess,
  onVerify,
  onFlag,
}: SwipeableMessageCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const SWIPE_THRESHOLD = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX.current;
    // Limit swipe range
    setSwipeX(Math.max(-150, Math.min(150, diff)));
  };

  const handleTouchEnd = () => {
    if (swipeX > SWIPE_THRESHOLD) {
      // Swipe right - Verify
      onVerify();
    } else if (swipeX < -SWIPE_THRESHOLD) {
      // Swipe left - Flag
      onFlag();
    }
    setSwipeX(0);
    setIsSwiping(false);
  };

  // Sanitize content for display
  const sanitizedContent = sanitizeText(message.content);
  const wasSanitized = sanitizedContent !== message.content;

  return (
    <div className="swipe-container relative">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-stretch overflow-hidden rounded-lg">
        {/* Verify (swipe right) */}
        <div
          className={cn(
            "flex flex-1 items-center justify-start bg-crisis-success/20 pl-4",
            swipeX > 50 && "bg-crisis-success/40"
          )}
        >
          <Shield className="h-6 w-6 text-crisis-success" aria-hidden="true" />
          <span className="ml-2 font-medium text-crisis-success text-sm">Verify</span>
        </div>
        {/* Flag (swipe left) */}
        <div
          className={cn(
            "flex flex-1 items-center justify-end bg-crisis-critical/20 pr-4",
            swipeX < -50 && "bg-crisis-critical/40"
          )}
        >
          <span className="mr-2 font-medium text-crisis-critical text-sm">Flag</span>
          <ShieldOff className="h-6 w-6 text-crisis-critical" aria-hidden="true" />
        </div>
      </div>

      {/* Card Content */}
      <div
        className={cn(
          "swipe-item relative rounded-lg border border-border bg-card p-3 transition-transform",
          isSwiping && "swiping"
        )}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="article"
        aria-label={`${message.source} message from ${message.author}. ${sanitizedContent.slice(0, 50)}...`}
      >
        {/* Source & Time */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
                message.source === "telegram"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-green-500/20 text-green-400"
              )}
            >
              {getSourceIcon(message.source)}
              <span className="sr-only">{message.source}</span>
            </span>
            <span className="font-mono text-muted-foreground text-xs">
              {message.author}
            </span>
            {wasSanitized && (
              <Badge variant="outline" className="text-[10px] border-crisis-warning/50 text-crisis-warning">
                Sanitized
              </Badge>
            )}
          </div>
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <time dateTime={new Date(message.timestamp).toISOString()}>
              {formatTime(message.timestamp)}
            </time>
          </span>
        </div>

        {/* Content */}
        <p className="mb-2 text-foreground text-sm leading-relaxed">
          {sanitizedContent}
        </p>

        {/* Metadata */}
        <div className="mb-2 flex items-center gap-3">
          {message.hasImage && (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <ImageIcon className="h-3 w-3" aria-hidden="true" />
              <span>Has image</span>
            </span>
          )}
          {message.location && (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              <span>Location attached</span>
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-border/50 pt-2">
          {message.isProcessing ? (
            <div className="flex items-center gap-2 text-crisis-warning text-sm" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>AI Processing...</span>
            </div>
          ) : (
            <Button
              size="sm"
              className="touch-target-lg min-h-[44px] flex-1 bg-crisis-warning text-primary-foreground hover:bg-crisis-warning/90"
              onClick={onProcess}
              aria-label={`Process message from ${message.author} with AI`}
            >
              <span>Process with AI</span>
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      role="status"
      aria-label="No unverified messages"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MessageCircle className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 font-medium text-foreground">No Pending Messages</h3>
      <p className="max-w-[200px] text-muted-foreground text-sm">
        All incoming reports have been processed or verified
      </p>
    </div>
  );
}
