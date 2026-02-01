"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RawMessage } from "@/lib/types";
import {
  MessageCircle,
  ImageIcon,
  MapPin,
  Clock,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnverifiedStreamProps {
  messages: RawMessage[];
  onProcessMessage?: (id: string) => void;
}

export function UnverifiedStream({
  messages,
  onProcessMessage,
}: UnverifiedStreamProps) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getSourceIcon = (source: "telegram" | "whatsapp") => {
    return source === "telegram" ? (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ) : (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="pulse-live h-2 w-2 rounded-full bg-crisis-warning" />
          <h2 className="font-semibold text-foreground">Unverified Stream</h2>
          <span className="rounded-full bg-crisis-warning/20 px-2 py-0.5 font-mono text-xs text-crisis-warning">
            {messages.length} pending
          </span>
        </div>
        <AlertTriangle className="h-4 w-4 text-crisis-warning" />
      </div>

      {/* Message List */}
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "glass cursor-pointer rounded-lg p-3 transition-all hover:bg-secondary/50",
              selectedMessage === message.id && "ring-1 ring-crisis-warning",
              message.isProcessing && "opacity-60"
            )}
            onClick={() => setSelectedMessage(message.id)}
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
                  {message.source}
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  {message.author}
                </span>
              </div>
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="h-3 w-3" />
                {formatTime(message.timestamp)}
              </span>
            </div>

            {/* Content */}
            <p className="mb-2 text-foreground text-sm leading-relaxed">
              {message.content}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-3">
              {message.hasImage && (
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  <ImageIcon className="h-3 w-3" />
                  Has image
                </span>
              )}
              {message.location && (
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  <MapPin className="h-3 w-3" />
                  Location attached
                </span>
              )}
            </div>

            {/* Actions */}
            {selectedMessage === message.id && (
              <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-3">
                {message.isProcessing ? (
                  <div className="flex items-center gap-2 text-crisis-warning text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI Processing...
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="touch-target min-h-[44px] bg-crisis-warning text-primary-foreground hover:bg-crisis-warning/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProcessMessage?.(message.id);
                    }}
                  >
                    <span>Process with AI</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
