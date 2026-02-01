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
          className="fixed inset-0 bg-black/60 z-[9998] animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Button Container - Highest z-index */}
      <div className="fixed bottom-20 right-4 z-[9999] lg:bottom-6 lg:right-6">
        {/* Success State */}
        {submitted && (
          <div className="absolute bottom-0 right-0 w-72 rounded-2xl bg-green-500 text-white p-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Report Submitted</p>
                <p className="text-sm text-white/80">Help is on the way</p>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Panel */}
        {isExpanded && !submitted && (
          <div className="absolute bottom-0 right-0 w-80 rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-red-500 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Report Emergency</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Location Status */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                {userLocation ? (
                  <span className="text-green-600 font-medium">Location available</span>
                ) : (
                  <span className="text-amber-600 font-medium">Location unavailable</span>
                )}
              </div>
            </div>

            {/* Emergency Types Grid */}
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
                      "flex flex-col items-center justify-center p-4 rounded-xl text-white transition-all",
                      type.color,
                      isSubmitting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                    <span className="text-sm font-medium mt-1">{type.label}</span>
                    <span className="text-xs text-white/80">{type.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Emergency Call */}
            <div className="px-3 pb-3">
              <button
                type="button"
                onClick={() => window.open("tel:911")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                <Phone className="h-5 w-5 text-red-500" />
                Call Emergency Services
              </button>
            </div>
          </div>
        )}

        {/* Main SOS Button */}
        {!isExpanded && !submitted && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 animate-pulse"
            aria-label="Report Emergency"
          >
            <AlertTriangle className="h-7 w-7" />
          </button>
        )}
      </div>
    </>
  );
}
