"use client";

import React from "react"

import { useState } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-crisis-success" />
          <h2 className="font-semibold text-foreground">Verified Command</h2>
        </div>
        <div className="flex items-center gap-1">
          {(["all", "verified", "unconfirmed", "resolved"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
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
      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        {/* Critical Section */}
        {groupedIncidents.critical.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-crisis-critical pulse-critical" />
              <span className="font-semibold text-crisis-critical text-sm">
                CRITICAL
              </span>
              <Badge variant="outline" className="border-crisis-critical/50 text-crisis-critical">
                {groupedIncidents.critical.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {groupedIncidents.critical.map((incident) => (
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

function IncidentCard({
  incident,
  onClick,
  formatTime,
}: {
  incident: Incident;
  onClick: () => void;
  formatTime: (ts: number) => string;
}) {
  const StatusIcon = statusConfig[incident.status].icon;
  const CategoryIcon = categoryIcons[incident.category] || HelpCircle;

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass group cursor-pointer rounded-lg p-3 transition-all hover:bg-secondary/50",
        incident.severity === "critical" &&
          "border-crisis-critical/30 ring-1 ring-crisis-critical/20"
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
              statusConfig[incident.status].bg,
              statusConfig[incident.status].color
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {incident.status}
          </span>
          <span className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-muted-foreground text-xs">
            <CategoryIcon className="h-3 w-3" />
            {incident.category}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <h3 className="mb-1 font-medium text-foreground text-sm leading-tight">
        {incident.title}
      </h3>

      <p className="mb-2 line-clamp-2 text-muted-foreground text-xs">
        {incident.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          {incident.location.address && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[120px] truncate">
                {incident.location.address}
              </span>
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            {incident.peerConfirmations}
          </span>
        </div>
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <Clock className="h-3 w-3" />
          {formatTime(incident.timestamp)}
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              incident.verification.score >= 80
                ? "bg-crisis-success"
                : incident.verification.score >= 50
                  ? "bg-crisis-warning"
                  : "bg-crisis-critical"
            )}
            style={{ width: `${incident.verification.score}%` }}
          />
        </div>
        <span className="font-mono text-muted-foreground text-xs">
          {incident.verification.score}%
        </span>
      </div>
    </div>
  );
}
