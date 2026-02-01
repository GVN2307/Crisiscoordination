"use client";

import React from "react";
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
  Activity,
  Shield,
  Droplets,
  Home,
  Utensils,
  Building2,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

interface IncidentCardProps {
  incident: Incident;
  onClick: () => void;
  formatTime: (ts: number) => string;
}

const statusConfig: Record<
  IncidentStatus,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  verified: {
    icon: CheckCircle2,
    color: "text-crisis-success",
    bg: "bg-crisis-success/20",
    label: "Verified incident",
  },
  unconfirmed: {
    icon: AlertCircle,
    color: "text-crisis-warning",
    bg: "bg-crisis-warning/20",
    label: "Unconfirmed incident",
  },
  debunked: {
    icon: XCircle,
    color: "text-crisis-critical",
    bg: "bg-crisis-critical/20",
    label: "Debunked report",
  },
  resolved: {
    icon: CheckCheck,
    color: "text-crisis-info",
    bg: "bg-crisis-info/20",
    label: "Resolved incident",
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

export function IncidentCard({ incident, onClick, formatTime }: IncidentCardProps) {
  const StatusIcon = statusConfig[incident.status].icon;
  const CategoryIcon = categoryIcons[incident.category] || HelpCircle;
  const statusLabel = statusConfig[incident.status].label;

  // Generate ARIA label for the card
  const ariaLabel = `${statusLabel}, ${incident.severity} severity, ${incident.category}. ${incident.title}. ${incident.peerConfirmations} peer confirmations. ${formatTime(incident.timestamp)}.`;

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      className={cn(
        "group cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
            <StatusIcon className="h-3 w-3" aria-hidden="true" />
            <span>{incident.status}</span>
          </span>
          <span className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-muted-foreground text-xs">
            <CategoryIcon className="h-3 w-3" aria-hidden="true" />
            <span>{incident.category}</span>
          </span>
        </div>
        <ChevronRight
          className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      <h4 className="mb-1 font-medium text-foreground text-sm leading-tight">
        {incident.title}
      </h4>

      <p className="mb-2 line-clamp-2 text-muted-foreground text-xs">
        {incident.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          {incident.location.address && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              <span className="max-w-[120px] truncate">
                {incident.location.address}
              </span>
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" aria-hidden="true" />
            <span>{incident.peerConfirmations}</span>
            <span className="sr-only">peer confirmations</span>
          </span>
        </div>
        <time
          dateTime={new Date(incident.timestamp).toISOString()}
          className="flex items-center gap-1 text-muted-foreground text-xs"
        >
          <Clock className="h-3 w-3" aria-hidden="true" />
          {formatTime(incident.timestamp)}
        </time>
      </div>

      {/* Confidence Bar */}
      <div className="mt-2 flex items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={incident.verification.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence score: ${incident.verification.score}%`}
        >
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
    </article>
  );
}
