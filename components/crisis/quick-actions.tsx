"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Droplets,
  Home,
  Stethoscope,
  Users,
  MessageSquare,
  MapPin,
  Phone,
  ShieldAlert,
  X,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface QuickActionsProps {
  onReportIncident: (type: string, location: { lat: number; lng: number } | null) => void;
  userLocation: { lat: number; lng: number } | null;
}

const emergencyTypes = [
  {
    id: "medical",
    label: "Medical",
    description: "Injuries, illness, or medical emergency",
    icon: Stethoscope,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    urgent: true,
  },
  {
    id: "security",
    label: "Security",
    description: "Violence, threats, or unsafe situation",
    icon: ShieldAlert,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    urgent: true,
  },
  {
    id: "shelter",
    label: "Shelter",
    description: "Need safe place to stay",
    icon: Home,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    urgent: false,
  },
  {
    id: "water",
    label: "Water/Food",
    description: "Need clean water or food",
    icon: Droplets,
    color: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
    urgent: false,
  },
  {
    id: "evacuation",
    label: "Evacuation",
    description: "Need help leaving the area",
    icon: Users,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    urgent: true,
  },
  {
    id: "other",
    label: "Other",
    description: "Report something else",
    icon: MessageSquare,
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    urgent: false,
  },
];

export function QuickActions({ onReportIncident, userLocation }: QuickActionsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!selectedType) return;

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      onReportIncident(selectedType, userLocation);
      setIsSubmitting(false);
      setIsSuccess(true);

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([50, 50, 50]);
      }

      // Close after showing success
      setTimeout(() => {
        setShowDialog(false);
        setSelectedType(null);
        setDescription("");
        setIsSuccess(false);
      }, 1500);
    }, 800);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setShowDialog(false);
    setSelectedType(null);
    setDescription("");
    setIsSuccess(false);
  };

  const selectedTypeData = emergencyTypes.find((t) => t.id === selectedType);

  return (
    <>
      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {emergencyTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => handleSelectType(type.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-all",
              "bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md",
              "min-h-[100px] active:scale-95"
            )}
          >
            <div className={cn("rounded-xl p-3 shadow-sm", type.color)}>
              <type.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 text-center">{type.label}</span>
            {type.urgent && (
              <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wide">
                Urgent
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Report Dialog - Fixed Overlay with High Z-Index */}
      {showDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success State */}
            {isSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Sent!</h3>
                <p className="text-gray-500">
                  Your emergency report has been submitted. Help is on the way.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {selectedTypeData && (
                      <div className={cn("rounded-lg p-2", selectedTypeData.color)}>
                        <selectedTypeData.icon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Report {selectedTypeData?.label} Emergency
                      </h3>
                      <p className="text-xs text-gray-500">{selectedTypeData?.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Location Display */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 border border-gray-200">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Your Location</p>
                      {userLocation ? (
                        <p className="text-xs text-gray-500 font-mono">
                          {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600">Location not available</p>
                      )}
                    </div>
                    {userLocation && (
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>

                  {/* Description Input */}
                  <div>
                    <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                      Describe your situation (optional)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What help do you need? Any additional details..."
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 h-12 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedType}
                      className={cn(
                        "flex-1 h-12 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50",
                        selectedTypeData?.color,
                        selectedTypeData?.hoverColor
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Report
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Emergency Call Option */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center mb-3">
                    For immediate life-threatening emergencies
                  </p>
                  <button
                    type="button"
                    onClick={() => window.open("tel:911")}
                    className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    Call Emergency Services (911)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
