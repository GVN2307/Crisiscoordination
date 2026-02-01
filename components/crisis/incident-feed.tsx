"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Stethoscope,
  Droplets,
  Home,
  ShieldAlert,
  Users,
  HelpCircle,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  infrastructure: Building2,
  other: HelpCircle,
};

const severityColors = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-sky-500",
  low: "bg-emerald-500",
};

const statusConfig = {
  verified: { label: "Verified", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  unconfirmed: { label: "Unconfirmed", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-gray-500", bg: "bg-gray-100" },
  debunked: { label: "False Report", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
};

export function IncidentFeed({ incidents, onSelectIncident }: IncidentFeedProps) {
  const [filter, setFilter] = useState<"all" | "critical" | "nearby" | "verified">("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Simulate refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Nearby Incidents</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors",
                isRefreshing && "animate-spin"
              )}
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
            <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
              {filteredIncidents.length}
            </Badge>
          </div>
        </div>

        {/* Filter Pills - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {(["all", "critical", "verified"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                filter === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {f === "all" && "All Incidents"}
              {f === "critical" && "Critical Only"}
              {f === "verified" && "Verified Only"}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Feed Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No incidents to show</h3>
            <p className="text-sm text-gray-500">
              {filter === "critical"
                ? "No critical incidents in your area"
                : "Stay safe and report any emergencies"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredIncidents.map((incident, index) => {
              const CategoryIcon = categoryIcons[incident.category] || HelpCircle;
              const statusInfo = statusConfig[incident.status] || statusConfig.unconfirmed;
              const StatusIcon = statusInfo.icon;

              return (
                <li key={incident.id}>
                  <button
                    type="button"
                    onClick={() => onSelectIncident?.(incident)}
                    className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left active:bg-gray-100"
                  >
                    {/* Severity Indicator */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                        severityColors[incident.severity]
                      )}
                    >
                      <CategoryIcon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
                          {incident.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {formatTime(incident.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {incident.description}
                      </p>

                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        {/* Status Badge */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                            statusInfo.bg,
                            statusInfo.color
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>

                        {/* Location */}
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {incident.location.address || `${incident.location.lat.toFixed(2)}, ${incident.location.lng.toFixed(2)}`}
                        </span>

                        {/* Peer Confirmations */}
                        {incident.peerConfirmations > 0 && (
                          <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Users className="h-3 w-3" />
                            {incident.peerConfirmations} confirmed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-3" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Bottom Padding for Mobile */}
        <div className="h-32 lg:h-4" />
      </div>
    </div>
  );
}
