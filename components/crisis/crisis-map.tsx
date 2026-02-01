"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";
import {
  Maximize2,
  Minimize2,
  Layers,
  MapPin,
  Flame,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CrisisMapProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  className?: string;
}

export function CrisisMap({
  incidents,
  onSelectIncident,
  className,
}: CrisisMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate heatmap rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Draw dark background
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw grid
    ctx.strokeStyle = "rgba(56, 189, 248, 0.1)";
    ctx.lineWidth = 0.5;
    const gridSize = 30;
    for (let x = 0; x < canvas.offsetWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.offsetHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.offsetHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.offsetWidth, y);
      ctx.stroke();
    }

    // Draw heatmap if enabled
    if (showHeatmap) {
      incidents.forEach((incident) => {
        // Convert lat/lng to canvas position (simplified)
        const x =
          ((incident.location.lng - 34.4) / 0.2) * canvas.offsetWidth / 2;
        const y =
          ((31.6 - incident.location.lat) / 0.2) * canvas.offsetHeight / 2;

        // Draw heatmap gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
        const color =
          incident.severity === "critical"
            ? "rgba(239, 68, 68, "
            : incident.severity === "high"
              ? "rgba(245, 158, 11, "
              : "rgba(56, 189, 248, ";

        gradient.addColorStop(0, color + "0.6)");
        gradient.addColorStop(0.5, color + "0.2)");
        gradient.addColorStop(1, color + "0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw incident markers
    incidents.forEach((incident) => {
      const x =
        ((incident.location.lng - 34.4) / 0.2) * canvas.offsetWidth / 2;
      const y =
        ((31.6 - incident.location.lat) / 0.2) * canvas.offsetHeight / 2;

      // Marker background
      ctx.fillStyle =
        incident.severity === "critical"
          ? "#ef4444"
          : incident.severity === "high"
            ? "#f59e0b"
            : incident.status === "resolved"
              ? "#10b981"
              : "#38bdf8";

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Pulse effect for critical
      if (incident.severity === "critical") {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner dot
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [incidents, showHeatmap]);

  return (
    <div
      className={cn(
        "glass-strong relative overflow-hidden rounded-lg",
        isExpanded ? "fixed inset-4 z-50" : "",
        className
      )}
    >
      {/* Map Canvas */}
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onClick={(e) => {
          // Find clicked incident
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          incidents.forEach((incident) => {
            const x =
              ((incident.location.lng - 34.4) / 0.2) * rect.width;
            const y = ((31.6 - incident.location.lat) / 0.2) * rect.height;
            const distance = Math.sqrt(
              (clickX - x) ** 2 + (clickY - y) ** 2
            );
            if (distance < 20) {
              onSelectIncident?.(incident);
            }
          });
        }}
      />

      {/* Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="glass h-10 w-10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className={cn("glass h-10 w-10", showHeatmap && "bg-crisis-warning/30")}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          <Flame className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="glass h-10 w-10">
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="glass absolute bottom-3 left-3 rounded-lg p-2">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-crisis-critical" />
            <span className="text-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-crisis-warning" />
            <span className="text-foreground">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-crisis-info" />
            <span className="text-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-crisis-success" />
            <span className="text-foreground">Resolved</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="glass absolute top-3 left-3 rounded-lg p-2">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="h-4 w-4 text-crisis-warning" />
          <span className="text-foreground">
            {incidents.length} incidents
          </span>
          <span className="text-muted-foreground">|</span>
          <Activity className="h-4 w-4 text-crisis-success" />
          <span className="text-foreground">
            {incidents.filter((i) => i.status === "verified").length} verified
          </span>
        </div>
      </div>
    </div>
  );
}
