"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Droplets,
  Home,
  Stethoscope,
  Users,
  MessageSquare,
  MapPin,
  Phone,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    urgent: true,
  },
  {
    id: "security",
    label: "Security",
    description: "Violence, threats, or unsafe situation",
    icon: ShieldAlert,
    color: "bg-orange-500",
    urgent: true,
  },
  {
    id: "shelter",
    label: "Shelter",
    description: "Need safe place to stay",
    icon: Home,
    color: "bg-blue-500",
    urgent: false,
  },
  {
    id: "water",
    label: "Water/Food",
    description: "Need clean water or food",
    icon: Droplets,
    color: "bg-cyan-500",
    urgent: false,
  },
  {
    id: "evacuation",
    label: "Evacuation",
    description: "Need help leaving the area",
    icon: Users,
    color: "bg-purple-500",
    urgent: true,
  },
  {
    id: "other",
    label: "Other",
    description: "Report something else",
    icon: MessageSquare,
    color: "bg-gray-500",
    urgent: false,
  },
];

export function QuickActions({ onReportIncident, userLocation }: QuickActionsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!selectedType) return;
    
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      onReportIncident(selectedType, userLocation);
      setIsSubmitting(false);
      setShowDialog(false);
      setSelectedType(null);
      setDescription("");
      
      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
    }, 500);
  };

  return (
    <>
      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {emergencyTypes.slice(0, 6).map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setSelectedType(type.id);
              setShowDialog(true);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-all active:scale-95",
              "bg-card border border-border hover:border-primary/50 hover:bg-card/80",
              "min-h-[100px] touch-target-lg"
            )}
          >
            <div className={cn("rounded-xl p-3", type.color)}>
              <type.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-center">{type.label}</span>
            {type.urgent && (
              <span className="text-[10px] text-crisis-critical font-medium uppercase">Urgent</span>
            )}
          </button>
        ))}
      </div>

      {/* Report Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedType
                ? `Report ${emergencyTypes.find((t) => t.id === selectedType)?.label}`
                : "Report Incident"}
            </DialogTitle>
            <DialogDescription>
              Your current location will be shared to help responders find you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Location Display */}
            <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Your Location</p>
                {userLocation ? (
                  <p className="text-xs text-muted-foreground font-mono">
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="text-xs text-crisis-warning">Location not available</p>
                )}
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className="text-sm font-medium mb-2 block">
                What do you need? (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your situation briefly..."
                className="w-full rounded-xl bg-muted border-none p-4 text-sm resize-none h-24 focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-xl bg-transparent"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-14 rounded-xl bg-primary text-primary-foreground"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedType}
              >
                {isSubmitting ? "Sending..." : "Send Report"}
              </Button>
            </div>

            {/* Emergency Call Option */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground text-center mb-3">
                For immediate life-threatening emergencies
              </p>
              <Button
                variant="destructive"
                className="w-full h-14 rounded-xl gap-2"
                onClick={() => window.open("tel:911")}
              >
                <Phone className="h-5 w-5" />
                Call Emergency Services
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
