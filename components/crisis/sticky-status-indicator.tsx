"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Globe, Radio, WifiOff, RefreshCw } from "lucide-react";

export type ConnectionStatus = "online" | "mesh" | "offline";

interface StickyStatusIndicatorProps {
  className?: string;
}

export function StickyStatusIndicator({ className }: StickyStatusIndicatorProps) {
  const [status, setStatus] = useState<ConnectionStatus>("online");
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      if (navigator.onLine) {
        setStatus("online");
      } else {
        setStatus("offline");
      }
    };

    updateStatus();

    const handleOnline = () => {
      setStatus("online");
      setIsReconnecting(false);
    };
    
    const handleOffline = () => {
      setStatus("offline");
      // Simulate mesh fallback attempt
      setIsReconnecting(true);
      setTimeout(() => {
        if (!navigator.onLine) {
          setStatus("mesh");
        }
        setIsReconnecting(false);
      }, 2000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const config = {
    online: {
      bg: "bg-green-500",
      text: "text-white",
      icon: Globe,
      label: "Online",
      description: "Connected to servers",
    },
    mesh: {
      bg: "bg-blue-500",
      text: "text-white",
      icon: Radio,
      label: "Mesh",
      description: "P2P network active",
    },
    offline: {
      bg: "bg-red-500",
      text: "text-white",
      icon: WifiOff,
      label: "Offline",
      description: "No connection",
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <div
      className={cn(
        "sticky top-0 z-[100] w-full",
        current.bg,
        current.text,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${current.label}. ${current.description}`}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-2 min-h-[40px]">
        {isReconnecting ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="text-sm font-semibold">Reconnecting...</span>
          </>
        ) : (
          <>
            <Icon 
              className={cn(
                "h-4 w-4",
                status === "mesh" && "animate-pulse"
              )} 
              aria-hidden="true" 
            />
            <span className="text-sm font-semibold">{current.label}</span>
            <span className="text-sm opacity-90 hidden sm:inline">- {current.description}</span>
          </>
        )}
      </div>
    </div>
  );
}
