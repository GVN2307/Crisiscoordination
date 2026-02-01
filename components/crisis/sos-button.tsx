"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, X, Send, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SOSButtonProps {
  onSubmit?: (data: SOSData) => void;
}

interface SOSData {
  type: "medical" | "evacuation" | "security" | "other";
  description: string;
  location: { lat: number; lng: number } | null;
}

export function SOSButton({ onSubmit }: SOSButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [sosData, setSOSData] = useState<SOSData>({
    type: "medical",
    description: "",
    location: null,
  });

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSOSData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          // Mock location for demo
          setSOSData((prev) => ({
            ...prev,
            location: { lat: 31.5, lng: 34.47 },
          }));
        }
      );
    }
  };

  const handleSubmit = () => {
    onSubmit?.(sosData);
    setIsOpen(false);
    setSOSData({ type: "medical", description: "", location: null });
  };

  const sosTypes = [
    { id: "medical", label: "Medical Emergency", icon: "+" },
    { id: "evacuation", label: "Need Evacuation", icon: "!" },
    { id: "security", label: "Security Threat", icon: "⚠" },
    { id: "other", label: "Other Emergency", icon: "?" },
  ] as const;

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "touch-target fixed right-4 bottom-4 z-40",
          "flex h-20 w-20 items-center justify-center",
          "rounded-full bg-crisis-critical",
          "shadow-lg shadow-crisis-critical/50",
          "pulse-critical",
          "transition-transform active:scale-95",
          "lg:right-8 lg:bottom-8"
        )}
        aria-label="Emergency SOS"
      >
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-8 w-8 text-foreground" />
          <span className="font-bold text-foreground text-xs">SOS</span>
        </div>
      </button>

      {/* SOS Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-strong border-crisis-critical/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-crisis-critical">
              <AlertTriangle className="h-5 w-5" />
              Emergency SOS Beacon
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Emergency Type */}
            <div>
              <label className="mb-2 block text-foreground text-sm font-medium">
                Emergency Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sosTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      setSOSData((prev) => ({ ...prev, type: type.id }))
                    }
                    className={cn(
                      "touch-target flex min-h-[60px] flex-col items-center justify-center rounded-lg border-2 p-3 transition-all",
                      sosData.type === type.id
                        ? "border-crisis-critical bg-crisis-critical/20 text-crisis-critical"
                        : "border-border bg-secondary text-foreground hover:border-crisis-critical/50"
                    )}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-foreground text-sm font-medium">
                Brief Description (optional)
              </label>
              <textarea
                value={sosData.description}
                onChange={(e) =>
                  setSOSData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your situation..."
                className="w-full rounded-lg border border-border bg-input p-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-crisis-critical"
                rows={3}
              />
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-foreground text-sm font-medium">
                Location
              </label>
              <Button
                variant="outline"
                className={cn(
                  "touch-target w-full justify-start min-h-[56px]",
                  sosData.location && "border-crisis-success text-crisis-success"
                )}
                onClick={handleGetLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting location...
                  </>
                ) : sosData.location ? (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Location captured ({sosData.location.lat.toFixed(4)},{" "}
                    {sosData.location.lng.toFixed(4)})
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Tap to share location
                  </>
                )}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="touch-target flex-1 min-h-[56px] bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                className="touch-target flex-1 bg-crisis-critical text-foreground min-h-[56px] hover:bg-crisis-critical/90"
                onClick={handleSubmit}
              >
                <Send className="mr-2 h-4 w-4" />
                Send SOS
              </Button>
            </div>

            <p className="text-center text-muted-foreground text-xs">
              Your SOS will be broadcast to nearby mesh nodes and verified
              responders
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
