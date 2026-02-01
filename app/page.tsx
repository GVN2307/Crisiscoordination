"use client";

import { useState, useCallback } from "react";
import { UnverifiedStream } from "@/components/crisis/unverified-stream";
import { VerifiedCommand } from "@/components/crisis/verified-command";
import { CrisisMap } from "@/components/crisis/crisis-map";
import { SOSButton } from "@/components/crisis/sos-button";
import { StatusBar } from "@/components/crisis/status-bar";
import { VerificationPanel } from "@/components/crisis/verification-panel";
import { MeshVisualizer } from "@/components/crisis/mesh-visualizer";
import {
  mockRawMessages,
  mockIncidents,
  mockMeshNodes,
  mockMeshConnections,
  mockNetworkStats,
} from "@/lib/mock-data";
import type { Incident } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Wifi, PanelLeftClose, PanelLeft, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CrisisOSDashboard() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [rawMessages, setRawMessages] = useState(mockRawMessages);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showMeshVisualizer, setShowMeshVisualizer] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showMap, setShowMap] = useState(true);

  const handleProcessMessage = useCallback((id: string) => {
    // Simulate AI processing
    setRawMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, isProcessing: true } : msg
      )
    );

    // Simulate processing delay and conversion to incident
    setTimeout(() => {
      const message = rawMessages.find((m) => m.id === id);
      if (!message) return;

      const newIncident: Incident = {
        id: `inc-new-${Date.now()}`,
        title: message.content.slice(0, 50) + "...",
        description: message.content,
        location: message.location || { lat: 31.5, lng: 34.47 },
        status: "unconfirmed",
        severity: message.content.toLowerCase().includes("urgent") ||
          message.content.toLowerCase().includes("critical")
          ? "critical"
          : "medium",
        category: message.content.toLowerCase().includes("medical")
          ? "medical"
          : message.content.toLowerCase().includes("water")
            ? "water"
            : "other",
        imageUrl: message.imageUrl,
        source: {
          type: message.source,
          authorityScore: 50,
        },
        verification: {
          score: 65,
          status: "unconfirmed",
          checks: [
            { type: "reverse_image", passed: true, confidence: 80, details: "No matches found" },
            { type: "geolocation", passed: true, confidence: 70, details: "Location plausible" },
            { type: "temporal", passed: false, confidence: 50, details: "Cannot verify time" },
          ],
          timestamp: Date.now(),
        },
        timestamp: message.timestamp,
        updatedAt: Date.now(),
        peerConfirmations: 0,
      };

      setIncidents((prev) => [newIncident, ...prev]);
      setRawMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2000);
  }, [rawMessages]);

  const handleVerifyIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: "verified",
              verification: { ...inc.verification, status: "verified", score: 95 },
            }
          : inc
      )
    );
    setSelectedIncident(null);
  }, []);

  const handleDebunkIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: "debunked",
              verification: { ...inc.verification, status: "debunked", score: 15 },
            }
          : inc
      )
    );
    setSelectedIncident(null);
  }, []);

  const handleSOSSubmit = useCallback((data: { type: string; description: string; location: { lat: number; lng: number } | null }) => {
    const newIncident: Incident = {
      id: `inc-sos-${Date.now()}`,
      title: `SOS: ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Emergency`,
      description: data.description || `Emergency ${data.type} assistance requested`,
      location: data.location || { lat: 31.5, lng: 34.47 },
      status: "unconfirmed",
      severity: "critical",
      category: data.type as Incident["category"],
      source: {
        type: "direct",
        authorityScore: 60,
      },
      verification: {
        score: 50,
        status: "pending",
        checks: [],
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      updatedAt: Date.now(),
      peerConfirmations: 0,
    };

    setIncidents((prev) => [newIncident, ...prev]);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Status Bar */}
      <StatusBar
        networkStats={mockNetworkStats}
        isOfflineMode={isOfflineMode}
        onToggleOffline={() => setIsOfflineMode(!isOfflineMode)}
      />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel: Unverified Stream */}
        <aside
          className={cn(
            "border-r border-border/50 transition-all duration-300",
            showLeftPanel ? "w-full md:w-[380px] lg:w-[420px]" : "w-0"
          )}
        >
          {showLeftPanel && <UnverifiedStream messages={rawMessages} onProcessMessage={handleProcessMessage} />}
        </aside>

        {/* Center/Right: Map + Verified Command */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowLeftPanel(!showLeftPanel)}
              >
                {showLeftPanel ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", showMap && "bg-secondary")}
                onClick={() => setShowMap(!showMap)}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => setShowMeshVisualizer(true)}
            >
              <Wifi className="h-4 w-4" />
              <span className="hidden sm:inline">Mesh Network</span>
            </Button>
          </div>

          {/* Content Grid */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {/* Map */}
            {showMap && (
              <div className="h-[250px] border-b border-border/50 lg:h-full lg:flex-1 lg:border-b-0 lg:border-r">
                <CrisisMap
                  incidents={incidents}
                  onSelectIncident={setSelectedIncident}
                  className="h-full w-full"
                />
              </div>
            )}

            {/* Verified Command */}
            <div className={cn("flex-1 overflow-hidden", showMap ? "lg:w-[400px] lg:flex-none" : "")}>
              <VerifiedCommand
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
              />
            </div>
          </div>
        </div>
      </main>

      {/* SOS Button */}
      <SOSButton onSubmit={handleSOSSubmit} />

      {/* Verification Panel (Slide-in) */}
      {selectedIncident && (
        <VerificationPanel
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onVerify={handleVerifyIncident}
          onDebunk={handleDebunkIncident}
          onRequestReview={(id) => {
            console.log("[v0] Human review requested for:", id);
            setSelectedIncident(null);
          }}
        />
      )}

      {/* Mesh Visualizer Modal */}
      <MeshVisualizer
        nodes={mockMeshNodes}
        connections={mockMeshConnections}
        stats={mockNetworkStats}
        isOpen={showMeshVisualizer}
        onClose={() => setShowMeshVisualizer(false)}
      />
    </div>
  );
}
