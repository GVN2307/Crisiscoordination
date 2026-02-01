"use client";

import React from "react";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Incident, VerificationCheck } from "@/lib/types";
import {
  X,
  ImageIcon,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ExternalLink,
  ChevronRight,
  FileText,
  Satellite,
  Users,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VerificationPanelProps {
  incident: Incident | null;
  onClose: () => void;
  onVerify?: (id: string) => void;
  onDebunk?: (id: string) => void;
  onRequestReview?: (id: string) => void;
}

export function VerificationPanel({
  incident,
  onClose,
  onVerify,
  onDebunk,
  onRequestReview,
}: VerificationPanelProps) {
  const [activeTab, setActiveTab] = useState<"image" | "metadata" | "chain">(
    "image"
  );

  if (!incident) return null;

  const checkIcons: Record<VerificationCheck["type"], React.ElementType> = {
    reverse_image: ImageIcon,
    geolocation: MapPin,
    temporal: Clock,
    satellite: Satellite,
    peer_confirm: Users,
  };

  const checkLabels: Record<VerificationCheck["type"], string> = {
    reverse_image: "Reverse Image",
    geolocation: "Geolocation",
    temporal: "Temporal Analysis",
    satellite: "Satellite Cross-Ref",
    peer_confirm: "Peer Confirmations",
  };

  return (
    <div className="glass-strong fixed inset-y-0 right-0 z-50 flex w-full flex-col md:w-[500px] lg:w-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-crisis-warning" />
          <h2 className="font-semibold text-foreground">AI Verification Review</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {/* Incident Summary */}
        <div className="border-b border-border/50 p-4">
          <h3 className="mb-2 font-medium text-foreground">{incident.title}</h3>
          <p className="mb-3 text-muted-foreground text-sm">
            {incident.description}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {incident.category}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                incident.severity === "critical" && "border-crisis-critical text-crisis-critical",
                incident.severity === "high" && "border-crisis-warning text-crisis-warning"
              )}
            >
              {incident.severity}
            </Badge>
            {incident.location.address && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <MapPin className="h-3 w-3" />
                {incident.location.address}
              </span>
            )}
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="border-b border-border/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-foreground text-sm font-medium">Confidence Score</span>
            <span
              className={cn(
                "font-mono text-2xl font-bold",
                incident.verification.score >= 80
                  ? "text-crisis-success"
                  : incident.verification.score >= 50
                    ? "text-crisis-warning"
                    : "text-crisis-critical"
              )}
            >
              {incident.verification.score}%
            </span>
          </div>

          {/* Radial Progress */}
          <div className="relative mx-auto mb-4 h-32 w-32">
            <svg className="h-full w-full -rotate-90 transform">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-secondary"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(incident.verification.score / 100) * 352} 352`}
                className={cn(
                  incident.verification.score >= 80
                    ? "text-crisis-success"
                    : incident.verification.score >= 50
                      ? "text-crisis-warning"
                      : "text-crisis-critical"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {incident.verification.score >= 80 ? (
                <CheckCircle2 className="h-8 w-8 text-crisis-success" />
              ) : incident.verification.score >= 50 ? (
                <AlertCircle className="h-8 w-8 text-crisis-warning" />
              ) : (
                <XCircle className="h-8 w-8 text-crisis-critical" />
              )}
              <span className="mt-1 text-muted-foreground text-xs">
                {incident.verification.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/50">
          <div className="flex">
            {(["image", "metadata", "chain"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 border-b-2 py-3 text-center text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "border-crisis-warning text-crisis-warning"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "image"
                  ? "Image Compare"
                  : tab === "metadata"
                    ? "EXIF Data"
                    : "Source Chain"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "image" && (
            <div className="space-y-4">
              {/* Image Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <span className="text-muted-foreground text-xs font-medium">
                    UPLOADED
                  </span>
                  <div className="aspect-video overflow-hidden rounded-lg bg-secondary">
                    {incident.imageUrl ? (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-muted-foreground text-xs">
                          No image
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-muted-foreground text-xs font-medium">
                    STREET VIEW REF
                  </span>
                  <div className="aspect-video overflow-hidden rounded-lg bg-secondary">
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reverse Image Result */}
              <div className="glass rounded-lg p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-foreground text-sm font-medium">
                    Reverse Image Search
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      incident.verification.checks.find(
                        (c) => c.type === "reverse_image"
                      )?.passed
                        ? "border-crisis-success text-crisis-success"
                        : "border-crisis-critical text-crisis-critical"
                    )}
                  >
                    {incident.verification.checks.find(
                      (c) => c.type === "reverse_image"
                    )?.passed
                      ? "No matches"
                      : "Matches found"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {incident.verification.checks.find(
                    (c) => c.type === "reverse_image"
                  )?.details || "Image appears to be original, no historical matches found."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="space-y-3">
              {/* EXIF Data */}
              <div className="glass rounded-lg p-3">
                <h4 className="mb-3 text-foreground text-sm font-medium">
                  EXIF Metadata
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span className="text-foreground">
                      {new Date(incident.timestamp).toISOString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GPS Lat</span>
                    <span className="text-foreground">
                      {incident.location.lat.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GPS Lng</span>
                    <span className="text-foreground">
                      {incident.location.lng.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device</span>
                    <span className="text-foreground">Samsung SM-G998B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Software</span>
                    <span className="text-foreground">Android 14</span>
                  </div>
                </div>
              </div>

              {/* Temporal Analysis */}
              <div className="glass rounded-lg p-3">
                <h4 className="mb-3 text-foreground text-sm font-medium">
                  Temporal Analysis
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shadow analysis</span>
                    <Badge
                      variant="outline"
                      className="border-crisis-success text-crisis-success"
                    >
                      Consistent
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Weather match</span>
                    <Badge
                      variant="outline"
                      className="border-crisis-success text-crisis-success"
                    >
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vegetation state</span>
                    <Badge variant="outline" className="border-crisis-warning text-crisis-warning">
                      Unverifiable
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chain" && (
            <div className="space-y-3">
              {/* Source Chain */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border" />

                {/* Chain items */}
                <div className="space-y-4">
                  {/* Original Source */}
                  <div className="relative flex gap-3 pl-8">
                    <div className="absolute left-2 top-1 h-4 w-4 rounded-full bg-crisis-info" />
                    <div className="glass flex-1 rounded-lg p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-foreground text-sm font-medium">
                          Original Report
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(incident.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Source: {incident.source.type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Score: {incident.source.authorityScore}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* AI Verification */}
                  <div className="relative flex gap-3 pl-8">
                    <div className="absolute left-2 top-1 h-4 w-4 rounded-full bg-crisis-warning" />
                    <div className="glass flex-1 rounded-lg p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-foreground text-sm font-medium">
                          AI Verification
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(
                            incident.verification.timestamp
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {incident.verification.checks.map((check, i) => {
                          const Icon = checkIcons[check.type];
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Icon className="h-3 w-3" />
                                {checkLabels[check.type]}
                              </span>
                              <span
                                className={cn(
                                  "font-mono",
                                  check.passed
                                    ? "text-crisis-success"
                                    : "text-crisis-critical"
                                )}
                              >
                                {check.confidence}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Peer Confirmations */}
                  {incident.peerConfirmations > 0 && (
                    <div className="relative flex gap-3 pl-8">
                      <div className="absolute left-2 top-1 h-4 w-4 rounded-full bg-crisis-success" />
                      <div className="glass flex-1 rounded-lg p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-foreground text-sm font-medium">
                            Peer Confirmations
                          </span>
                          <Badge
                            variant="outline"
                            className="border-crisis-success text-crisis-success"
                          >
                            {incident.peerConfirmations} confirmed
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Verified by {incident.peerConfirmations} mesh nodes
                          within 1km radius
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border/50 p-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="touch-target flex-1 border-crisis-success text-crisis-success min-h-[56px] hover:bg-crisis-success/10 bg-transparent"
            onClick={() => onVerify?.(incident.id)}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Verify
          </Button>
          <Button
            variant="outline"
            className="touch-target flex-1 border-crisis-critical text-crisis-critical min-h-[56px] hover:bg-crisis-critical/10 bg-transparent"
            onClick={() => onDebunk?.(incident.id)}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Flag as False
          </Button>
          <Button
            variant="outline"
            className="touch-target flex-1 min-h-[56px] bg-transparent"
            onClick={() => onRequestReview?.(incident.id)}
          >
            <Flag className="mr-2 h-4 w-4" />
            Human Review
          </Button>
        </div>
      </div>
    </div>
  );
}
