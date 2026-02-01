"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  X,
  Stethoscope,
  ShieldAlert,
  Home,
  Droplets,
  Users,
  HelpCircle,
  Phone,
  Loader2,
  Check,
  MapPin,
} from "lucide-react";

interface FloatingSOSProps {
  onReportIncident: (type: string, location: { lat: number; lng: number } | null) => void;
  userLocation: { lat: number; lng: number } | null;
}

const emergencyTypes = [
  {
    id: "medical",
    label: "Medical",
    icon: Stethoscope,
    color: "bg-red-500 hover:bg-red-600",
    description: "Injury or illness",
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldAlert,
    color: "bg-orange-500 hover:bg-orange-600",
    description: "Threat or danger",
  },
  {
    id: "shelter",
    label: "Shelter",
    icon: Home,
    color: "bg-blue-500 hover:bg-blue-600",
    description: "Need safe place",
  },
  {
    id: "water",
    label: "Water/Food",
    icon: Droplets,
    color: "bg-cyan-500 hover:bg-cyan-600",
    description: "Basic supplies",
  },
  {
    id: "evacuation",
    label: "Evacuation",
    icon: Users,
    color: "bg-purple-500 hover:bg-purple-600",
    description: "Need transport",
  },
  {
    id: "other",
    label: "Other",
    icon: HelpCircle,
    color: "bg-gray-500 hover:bg-gray-600",
    description: "General help",
  },
];

export function FloatingSOS({ onReportIncident, userLocation }: FloatingSOSProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReport = useCallback(
    async (type: string) => {
      setIsSubmitting(true);

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      // Simulate brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      onReportIncident(type, userLocation);

      setIsSubmitting(false);
      setSubmitted(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        setIsExpanded(false);
      }, 2000);
    },
    [onReportIncident, userLocation]
  );

  return (
    <>
      {/* Overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/70 z-[9996] animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Button Container - Fixed bottom-right, 64x64px */}
      <div className="fixed bottom-6 right-4 z-[9997] lg:bottom-8 lg:right-8 rtl:right-auto rtl:left-4 lg:rtl:left-8">
        {/* Success State */}
        {submitted && (
          <div 
            className="absolute bottom-0 right-0 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-green-600 text-white p-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-200"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full bg-white/20 flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Report Submitted</p>
                <p className="text-sm text-white/90">Help is on the way</p>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Panel */}
        {isExpanded && !submitted && (
          <div 
            className="absolute bottom-0 right-0 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-dialog-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-red-600 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span id="sos-dialog-title" className="font-bold text-lg">Report Emergency</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close emergency dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Location Status */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                {userLocation ? (
                  <span className="text-green-700 font-semibold">Location Protected - Ready to send</span>
                ) : (
                  <span className="text-amber-700 font-semibold">Location unavailable - Report will be sent without coordinates</span>
                )}
              </div>
            </div>

            {/* Emergency Types Grid - All buttons min 56px height */}
            <div className="p-3 grid grid-cols-2 gap-2">
              {emergencyTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleReport(type.id)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 min-h-[72px] rounded-xl text-white transition-all",
                      "focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-red-500",
                      type.color,
                      isSubmitting && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label={`Report ${type.label} emergency: ${type.description}`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-7 w-7 animate-spin" />
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                    <span className="text-sm font-bold mt-1">{type.label}</span>
                    <span className="text-xs text-white/90">{type.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Emergency Call - min 56px height */}
            <div className="px-3 pb-3">
              <a
                href="tel:911"
                className="w-full flex items-center justify-center gap-2 py-4 min-h-[56px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-500"
                aria-label="Call emergency services at 911"
              >
                <Phone className="h-5 w-5 text-red-600" />
                Call Emergency Services
              </a>
            </div>
          </div>
        )}

        {/* Main SOS Button - 64x64px fixed size */}
        {!isExpanded && !submitted && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className={cn(
              "h-16 w-16 min-h-[64px] min-w-[64px] rounded-full bg-red-600 hover:bg-red-700 text-white",
              "shadow-2xl flex items-center justify-center transition-all",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-red-500",
              "animate-pulse"
            )}
            aria-label="Open emergency report menu - Press to report an emergency"
            aria-haspopup="dialog"
          >
            <AlertTriangle className="h-8 w-8" />
          </button>
        )}
      </div>
    </>
  );
}
