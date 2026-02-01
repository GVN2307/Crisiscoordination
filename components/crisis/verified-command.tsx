"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Incident, IncidentStatus } from "@/lib/types";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  CheckCheck,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  Shield,
  Activity,
  Droplets,
  Home,
  Utensils,
  Building2,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
  Megaphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyIncidentState } from "@/components/crisis/empty-incident-state"; // Import EmptyIncidentState
import { IncidentCard } from "@/components/crisis/incident-card"; // Import IncidentCard

interface VerifiedCommandProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
}

const statusConfig: Record<
  IncidentStatus,
  { icon: React.ElementType; color: string; bg: string }
> = {
  verified: {
    icon: CheckCircle2,
    color: "text-crisis-success",
    bg: "bg-crisis-success/20",
  },
  unconfirmed: {
    icon: AlertCircle,
    color: "text-crisis-warning",
    bg: "bg-crisis-warning/20",
  },
  debunked: {
    icon: XCircle,
    color: "text-crisis-critical",
    bg: "bg-crisis-critical/20",
  },
  resolved: {
    icon: CheckCheck,
    color: "text-crisis-info",
    bg: "bg-crisis-info/20",
  },
};

const categoryIcons: Record<string, React.ElementType> = {
  medical: Activity,
  evacuation: Shield,
  water: Droplets,
  shelter: Home,
  food: Utensils,
  infrastructure: Building2,
  security: ShieldAlert,
  other: HelpCircle,
};

export function VerifiedCommand({
  incidents,
  onSelectIncident,
}: VerifiedCommandProps) {
  const [filter, setFilter] = useState<IncidentStatus | "all">("all");

  const filteredIncidents =
    filter === "all"
      ? incidents
      : incidents.filter((inc) => inc.status === filter);

  const groupedIncidents = {
    critical: filteredIncidents.filter((inc) => inc.severity === "critical"),
    high: filteredIncidents.filter((inc) => inc.severity === "high"),
    medium: filteredIncidents.filter((inc) => inc.severity === "medium"),
    low: filteredIncidents.filter((inc) => inc.severity === "low"),
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const totalIncidents = filteredIncidents.length;

  return (
    <div className="flex h-full flex-col" role="region" aria-label="Verified incident command center">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-crisis-success" aria-hidden="true" />
          <h2 className="font-semibold text-foreground">Verified Command</h2>
          <span className="sr-only">{totalIncidents} incidents</span>
        </div>
        <div className="flex items-center gap-1" role="tablist" aria-label="Filter incidents">
          {(["all", "verified", "unconfirmed", "resolved"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                role="tab"
                aria-selected={filter === status}
                aria-controls="incident-list"
                className={cn(
                  "touch-target-lg min-h-[44px] rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  filter === status
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Kanban Columns */}
      <div id="incident-list" className="scrollbar-thin flex-1 overflow-y-auto p-3" role="tabpanel">
        {/* Empty State */}
        {totalIncidents === 0 && <EmptyIncidentState onBroadcastSOS={() => {}} />}

        {/* Critical Section */}
        {groupedIncidents.critical.length > 0 && (
          <section className="mb-4" aria-labelledby="critical-heading">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-crisis-critical pulse-critical" aria-hidden="true" />
              <h3 id="critical-heading" className="font-semibold text-crisis-critical text-sm">
                CRITICAL - IMMEDIATE DANGER
              </h3>
              <Badge variant="outline" className="border-crisis-critical/50 text-crisis-critical">
                {groupedIncidents.critical.length}
              </Badge>
            </div>
            <div className="space-y-2" role="list">
              {groupedIncidents.critical.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onClick={() => onSelectIncident?.(incident)}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </section>
        )}

        {/* High Section */}
        {groupedIncidents.high.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-crisis-warning" />
              <span className="font-semibold text-crisis-warning text-sm">
                HIGH
              </span>
              <Badge variant="outline" className="border-crisis-warning/50 text-crisis-warning">
                {groupedIncidents.high.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {groupedIncidents.high.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onClick={() => onSelectIncident?.(incident)}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* Medium Section */}
        {groupedIncidents.medium.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-crisis-info" />
              <span className="font-semibold text-crisis-info text-sm">
                MEDIUM
              </span>
              <Badge variant="outline" className="border-crisis-info/50 text-crisis-info">
                {groupedIncidents.medium.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {groupedIncidents.medium.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onClick={() => onSelectIncident?.(incident)}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* Low/Resolved Section */}
        {groupedIncidents.low.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-crisis-success" />
              <span className="font-semibold text-crisis-success text-sm">
                LOW / RESOLVED
              </span>
              <Badge variant="outline" className="border-crisis-success/50 text-crisis-success">
                {groupedIncidents.low.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {groupedIncidents.low.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onClick={() => onSelectIncident?.(incident)}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
