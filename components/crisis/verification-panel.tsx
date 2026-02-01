"use client";

import React from "react"

import { cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";
import {
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  ThumbsUp,
  ThumbsDown,
  Navigation,
  Share2,
  Phone,
  Stethoscope,
  Droplets,
  Home,
  ShieldAlert,
  HelpCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface VerificationPanelProps {
  incident: Incident | null;
  onClose: () => void;
  onVerify?: (id: string) => void;
  onDebunk?: (id: string) => void;
  onRequestReview?: (id: string) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  medical: Stethoscope,
  water: Droplets,
  shelter: Home,
  security: ShieldAlert,
  evacuation: Users,
  other: HelpCircle,
};

const severityConfig = {
  critical: { label: "Critical", color: "bg-crisis-critical", textColor: "text-crisis-critical" },
  high: { label: "High Priority", color: "bg-crisis-warning", textColor: "text-crisis-warning" },
  medium: { label: "Medium", color: "bg-crisis-info", textColor: "text-crisis-info" },
  low: { label: "Low", color: "bg-crisis-success", textColor: "text-crisis-success" },
};

const statusConfig = {
  verified: { label: "Verified", icon: CheckCircle2, color: "text-crisis-success", bg: "bg-crisis-success/20" },
  unconfirmed: { label: "Unconfirmed", icon: AlertCircle, color: "text-crisis-warning", bg: "bg-crisis-warning/20" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-muted-foreground", bg: "bg-muted" },
  debunked: { label: "False Report", icon: XCircle, color: "text-crisis-critical", bg: "bg-crisis-critical/20" },
};

export function VerificationPanel({
  incident,
  onClose,
  onVerify,
  onDebunk,
  onRequestReview,
}: VerificationPanelProps) {
  if (!incident) return null;

  const CategoryIcon = categoryIcons[incident.category] || HelpCircle;
  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const StatusIcon = status.icon;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString();
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.location.lat},${incident.location.lng}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    const text = `Emergency: ${incident.title}\nLocation: ${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`;
    
    if (navigator.share) {
      await navigator.share({ title: "Emergency Report", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <Sheet open={!!incident} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Drag Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4">
            {/* Header Card */}
            <div className="flex items-start gap-4 mb-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0", severity.color)}>
                <CategoryIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold mb-1 line-clamp-2">{incident.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn("rounded-full", severity.color, "text-white border-none")}>
                    {severity.label}
                  </Badge>
                  <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", status.bg, status.color)}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full flex-shrink-0"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6">{incident.description}</p>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Location Card */}
              <button
                onClick={handleGetDirections}
                className="flex items-center gap-3 p-4 rounded-2xl bg-muted hover:bg-muted/80 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                  <p className="text-sm font-medium font-mono truncate">
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </p>
                </div>
              </button>

              {/* Time Card */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Reported</p>
                  <p className="text-sm font-medium">{formatTime(incident.timestamp)}</p>
                </div>
              </div>
            </div>

            {/* Verification Score */}
            <div className="rounded-2xl bg-muted p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Verification Score</span>
                <span className={cn(
                  "text-2xl font-bold font-mono",
                  incident.verification.score >= 80 ? "text-crisis-success" :
                  incident.verification.score >= 50 ? "text-crisis-warning" :
                  "text-crisis-critical"
                )}>
                  {incident.verification.score}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-3 rounded-full bg-background overflow-hidden mb-3">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    incident.verification.score >= 80 ? "bg-crisis-success" :
                    incident.verification.score >= 50 ? "bg-crisis-warning" :
                    "bg-crisis-critical"
                  )}
                  style={{ width: `${incident.verification.score}%` }}
                />
              </div>

              {/* Verification Checks */}
              <div className="flex flex-wrap gap-2">
                {incident.verification.checks.map((check, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                      check.passed
                        ? "bg-crisis-success/20 text-crisis-success"
                        : "bg-crisis-critical/20 text-crisis-critical"
                    )}
                  >
                    {check.passed ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {check.type.replace("_", " ")}
                  </div>
                ))}
              </div>
            </div>

            {/* Peer Confirmations */}
            {incident.peerConfirmations > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-crisis-success/10 border border-crisis-success/20 mb-6">
                <Users className="h-5 w-5 text-crisis-success" />
                <span className="text-sm">
                  <strong>{incident.peerConfirmations}</strong> nearby users confirmed this report
                </span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 mb-6">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl gap-2 bg-transparent"
                onClick={handleGetDirections}
              >
                <Navigation className="h-4 w-4" />
                Directions
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl gap-2 bg-transparent"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-xl bg-transparent"
                onClick={() => window.open("tel:911")}
              >
                <Phone className="h-4 w-4 text-crisis-critical" />
              </Button>
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="border-t border-border p-4 bg-card safe-area-inset-bottom">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Can you confirm this report is accurate?
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1 h-14 rounded-2xl bg-crisis-success hover:bg-crisis-success/90 text-white gap-2"
                onClick={() => onVerify?.(incident.id)}
              >
                <ThumbsUp className="h-5 w-5" />
                Confirm
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl border-crisis-critical text-crisis-critical hover:bg-crisis-critical/10 gap-2 bg-transparent"
                onClick={() => onDebunk?.(incident.id)}
              >
                <ThumbsDown className="h-5 w-5" />
                False Report
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
