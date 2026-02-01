"use client";

import React from "react"

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  Stethoscope,
  Droplets,
  Home,
  ShieldAlert,
  Users,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IncidentFeedProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  medical: Stethoscope,
  water: Droplets,
  shelter: Home,
  security: ShieldAlert,
  evacuation: Users,
  other: HelpCircle,
};

const severityColors = {
  critical: "bg-crisis-critical",
  high: "bg-crisis-warning",
  medium: "bg-crisis-info",
  low: "bg-crisis-success",
};

const statusConfig = {
  verified: { label: "Verified", icon: CheckCircle2, color: "text-crisis-success" },
  unconfirmed: { label: "Unconfirmed", icon: Clock, color: "text-crisis-warning" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-muted-foreground" },
  debunked: { label: "False Report", icon: AlertTriangle, color: "text-crisis-critical" },
};

export function IncidentFeed({ incidents, onSelectIncident }: IncidentFeedProps) {
  const [filter, setFilter] = useState<"all" | "critical" | "nearby" | "verified">("all");

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === "all") return true;
    if (filter === "critical") return inc.severity === "critical" || inc.severity === "high";
    if (filter === "verified") return inc.status === "verified";
    return true;
  });

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Nearby Incidents</h2>
          <Badge variant="outline" className="font-mono">
            {filteredIncidents.length}
          </Badge>
        </div>
        
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {(["all", "critical", "verified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f === "all" && "All"}
              {f === "critical" && "Critical"}
              {f === "verified" && "Verified"}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No incidents to show</h3>
            <p className="text-sm text-muted-foreground">
              {filter === "critical"
                ? "No critical incidents in your area"
                : "Stay safe and report any emergencies"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredIncidents.map((incident) => {
              const CategoryIcon = categoryIcons[incident.category] || HelpCircle;
              const statusInfo = statusConfig[incident.status];
              const StatusIcon = statusInfo.icon;

              return (
                <button
                  key={incident.id}
                  onClick={() => onSelectIncident?.(incident)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left active:bg-muted"
                >
                  {/* Severity Indicator */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      severityColors[incident.severity]
                    )}
                  >
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm line-clamp-1">{incident.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(incident.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {incident.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs">
                      {/* Status */}
                      <div className={cn("flex items-center gap-1", statusInfo.color)}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span>{statusInfo.label}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {incident.location.lat.toFixed(2)}, {incident.location.lng.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-3" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
