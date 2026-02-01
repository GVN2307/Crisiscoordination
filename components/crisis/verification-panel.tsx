"use client";

import React from "react";
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
  Building2,
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
  infrastructure: Building2,
  other: HelpCircle,
};

const severityConfig = {
  critical: { label: "Critical", color: "bg-red-500", textColor: "text-red-600" },
  high: { label: "High Priority", color: "bg-amber-500", textColor: "text-amber-600" },
  medium: { label: "Medium", color: "bg-sky-500", textColor: "text-sky-600" },
  low: { label: "Low", color: "bg-emerald-500", textColor: "text-emerald-600" },
};

const statusConfig = {
  verified: { label: "Verified", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
  unconfirmed: { label: "Unconfirmed", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-gray-500", bg: "bg-gray-100" },
  debunked: { label: "False Report", icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

export function VerificationPanel({
  incident,
  onClose,
  onVerify,
  onDebunk,
}: VerificationPanelProps) {
  if (!incident) return null;

  const CategoryIcon = categoryIcons[incident.category] || HelpCircle;
  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status] || statusConfig.unconfirmed;
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
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden bg-white">
        <div className="flex flex-col h-full">
          {/* Drag Handle */}
          <div className="flex justify-center py-3 flex-shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-gray-300" />
          </div>

          {/* Scrollable Content */}
          <div
            className="flex-1 px-4 pb-4"
            style={{
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              minHeight: 0,
            }}
          >
            {/* Header Card */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                  severity.color
                )}
              >
                <CategoryIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                  {incident.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn("rounded-full", severity.color, "text-white border-none")}>
                    {severity.label}
                  </Badge>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                      status.bg,
                      status.color
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">{incident.description}</p>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Location Card */}
              <button
                type="button"
                onClick={handleGetDirections}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors text-left border border-gray-200"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Location</p>
                  <p className="text-sm font-medium text-gray-900 font-mono truncate">
                    {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                  </p>
                </div>
              </button>

              {/* Time Card */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Reported</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatTime(incident.timestamp)}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Score */}
            <div className="rounded-2xl bg-gray-50 p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">Verification Score</span>
                <span
                  className={cn(
                    "text-2xl font-bold font-mono",
                    incident.verification.score >= 80
                      ? "text-emerald-600"
                      : incident.verification.score >= 50
                        ? "text-amber-600"
                        : "text-red-600"
                  )}
                >
                  {incident.verification.score}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 rounded-full bg-gray-200 overflow-hidden mb-3">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    incident.verification.score >= 80
                      ? "bg-emerald-500"
                      : incident.verification.score >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  )}
                  style={{ width: `${incident.verification.score}%` }}
                />
              </div>

              {/* Verification Checks */}
              <div className="flex flex-wrap gap-2">
                {incident.verification.checks.map((check, i) => (
                  <div
                    key={`${check.type}-${i}`}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                      check.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
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
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6">
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-emerald-800">
                  <strong>{incident.peerConfirmations}</strong> nearby users confirmed this report
                </span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={handleGetDirections}
                className="flex-1 h-12 rounded-xl border border-gray-300 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                <Navigation className="h-4 w-4" />
                Directions
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 h-12 rounded-xl border border-gray-300 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                type="button"
                onClick={() => window.open("tel:911")}
                className="h-12 w-12 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Phone className="h-4 w-4 text-red-500" />
              </button>
            </div>

            {/* Bottom padding for safe scroll */}
            <div className="h-4" />
          </div>

          {/* Fixed Bottom Actions */}
          <div className="border-t border-gray-200 p-4 bg-white safe-area-inset-bottom flex-shrink-0">
            <p className="text-xs text-gray-500 text-center mb-3">
              Can you confirm this report is accurate?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onVerify?.(incident.id)}
                className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ThumbsUp className="h-5 w-5" />
                Confirm
              </button>
              <button
                type="button"
                onClick={() => onDebunk?.(incident.id)}
                className="flex-1 h-14 rounded-2xl border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ThumbsDown className="h-5 w-5" />
                False Report
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
