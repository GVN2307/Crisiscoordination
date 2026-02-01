"use client";

import { Shield, Megaphone, MapPin, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyIncidentStateProps {
  onBroadcastSOS: () => void;
  radiusKm?: number;
}

export function EmptyIncidentState({
  onBroadcastSOS,
  radiusKm = 5,
}: EmptyIncidentStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-label="No incidents in your area"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-crisis-success/10">
          <Shield className="h-12 w-12 text-crisis-success" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-crisis-success">
          <MapPin className="h-4 w-4 text-crisis-success" />
        </div>
      </div>

      {/* Message */}
      <h3 className="mb-2 font-semibold text-foreground text-lg">
        No Verified Incidents Nearby
      </h3>
      <p className="mb-6 max-w-[280px] text-muted-foreground text-sm leading-relaxed">
        There are no verified incidents within your {radiusKm}km radius. Stay
        alert and report any emergencies you encounter.
      </p>

      {/* Stats */}
      <div className="mb-6 flex items-center gap-4 rounded-lg bg-secondary/50 px-4 py-3">
        <div className="text-center">
          <span className="block font-mono text-foreground text-xl font-bold">0</span>
          <span className="text-muted-foreground text-xs">Active</span>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <span className="block font-mono text-crisis-success text-xl font-bold">
            {radiusKm}km
          </span>
          <span className="text-muted-foreground text-xs">Radius</span>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-1 text-center">
          <Radio className="h-4 w-4 pulse-live text-crisis-info" />
          <span className="text-muted-foreground text-xs">Monitoring</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={onBroadcastSOS}
        className="touch-target-lg min-h-[56px] bg-crisis-warning text-primary-foreground hover:bg-crisis-warning/90"
      >
        <Megaphone className="mr-2 h-5 w-5" />
        Broadcast SOS
      </Button>
    </div>
  );
}
