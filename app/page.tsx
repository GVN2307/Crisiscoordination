"use client";

import { useState, useCallback, useEffect } from "react";
import { UnverifiedDrawer } from "@/components/crisis/unverified-drawer";
import { VerifiedCommand } from "@/components/crisis/verified-command";
import { CrisisMap } from "@/components/crisis/crisis-map";
import { SOSButton } from "@/components/crisis/sos-button";
import { StatusBar } from "@/components/crisis/status-bar";
import { ConnectionStatusBar } from "@/components/crisis/connection-status-bar";
import { VerificationPanel } from "@/components/crisis/verification-panel";
import { MeshVisualizer } from "@/components/crisis/mesh-visualizer";
import { SettingsPanel } from "@/components/crisis/settings-panel";
import { CrisisErrorBoundary, VerificationErrorFallback } from "@/components/crisis/error-boundary";
import { FlagFalseConfirmation, VerifyConfirmation } from "@/components/crisis/confirmation-modal";
import {
  mockRawMessages,
  mockIncidents,
  mockMeshNodes,
  mockMeshConnections,
  mockNetworkStats,
} from "@/lib/mock-data";
import type { Incident } from "@/lib/types";
import type { ConnectionState, QueuedMessage } from "@/lib/connection-store";
import { queueMessage, detectConnectionState } from "@/lib/connection-store";
import { checkRateLimit } from "@/lib/security";
import { AccessibilityProvider, useAccessibility } from "@/lib/accessibility-context";
import { Button } from "@/components/ui/button";
import { Wifi, Map, PanelLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

function CrisisOSDashboardContent() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [rawMessages, setRawMessages] = useState(mockRawMessages);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showMeshVisualizer, setShowMeshVisualizer] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>("online");
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [peerCount, setPeerCount] = useState(5);

  // Confirmation modals
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; id: string } | null>(null);

  // Rate limiting
  const [uploadRateInfo, setUploadRateInfo] = useState({ remaining: 5, resetIn: 0 });

  const { batterySaverMode } = useAccessibility();

  // Simulate network status changes
  useEffect(() => {
    const handleOnline = () => {
      const newState = detectConnectionState(true, peerCount);
      setConnectionState(newState);
    };
    const handleOffline = () => {
      const newState = detectConnectionState(false, peerCount);
      setConnectionState(newState);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [peerCount]);

  const handleProcessMessage = useCallback((id: string) => {
    // Check rate limit
    const rateCheck = checkRateLimit("user-1", "imageUpload");
    setUploadRateInfo({ remaining: rateCheck.remaining, resetIn: rateCheck.resetIn });

    if (!rateCheck.allowed) {
      return;
    }

    // Simulate AI processing
    setRawMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, isProcessing: true } : msg
      )
    );

    // If offline, queue the message
    if (connectionState !== "online") {
      const message = rawMessages.find((m) => m.id === id);
      if (message) {
        setQueuedMessages((prev) => queueMessage(prev, "report", { messageId: id }));
      }
    }

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
  }, [rawMessages, connectionState]);

  const handleVerifyIncident = useCallback((id: string) => {
    setPendingAction({ type: "verify", id });
    setShowVerifyConfirm(true);
  }, []);

  const handleConfirmVerify = useCallback(() => {
    if (!pendingAction) return;

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === pendingAction.id
          ? {
              ...inc,
              status: "verified",
              verification: { ...inc.verification, status: "verified", score: 95 },
            }
          : inc
      )
    );
    setSelectedIncident(null);
    setShowVerifyConfirm(false);
    setPendingAction(null);

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, [pendingAction]);

  const handleDebunkIncident = useCallback((id: string) => {
    setPendingAction({ type: "flag", id });
    setShowFlagConfirm(true);
  }, []);

  const handleConfirmDebunk = useCallback(() => {
    if (!pendingAction) return;

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === pendingAction.id
          ? {
              ...inc,
              status: "debunked",
              verification: { ...inc.verification, status: "debunked", score: 15 },
            }
          : inc
      )
    );
    setSelectedIncident(null);
    setShowFlagConfirm(false);
    setPendingAction(null);
  }, [pendingAction]);

  const handleSOSSubmit = useCallback((data: { type: string; description: string; location: { lat: number; lng: number } | null }) => {
    // Queue if offline
    if (connectionState !== "online") {
      setQueuedMessages((prev) => queueMessage(prev, "sos", data));
    }

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

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [connectionState]);

  const handleRetrySync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setQueuedMessages([]);
      setIsSyncing(false);
      setConnectionState("online");
    }, 2000);
  }, []);

  const handleClearQueue = useCallback(() => {
    setQueuedMessages([]);
  }, []);

  // Toggle offline mode for demo
  const handleToggleOffline = useCallback(() => {
    if (connectionState === "online") {
      setConnectionState("mesh");
      setPeerCount(3);
    } else if (connectionState === "mesh") {
      setConnectionState("isolated");
      setPeerCount(0);
    } else {
      setConnectionState("online");
      setPeerCount(5);
    }
  }, [connectionState]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Skip to content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Connection Status Bar */}
      <ConnectionStatusBar
        state={connectionState}
        peerCount={peerCount}
        queuedMessages={queuedMessages}
        isSyncing={isSyncing}
        onRetrySync={handleRetrySync}
        onDismissQueue={handleClearQueue}
        isSecureMesh={true}
      />

      {/* Status Bar */}
      <StatusBar
        networkStats={mockNetworkStats}
        isOfflineMode={connectionState !== "online"}
        onToggleOffline={handleToggleOffline}
      />

      {/* Main Content */}
      <main id="main-content" className="flex flex-1 overflow-hidden">
        {/* Left Panel: Unverified Stream (Drawer on mobile) */}
        <UnverifiedDrawer
          messages={rawMessages}
          onProcessMessage={handleProcessMessage}
          onVerifyMessage={(id) => {
            // Quick verify from swipe
            setPendingAction({ type: "verify", id });
            setShowVerifyConfirm(true);
          }}
          onFlagMessage={(id) => {
            setPendingAction({ type: "flag", id });
            setShowFlagConfirm(true);
          }}
          isOpen={showLeftDrawer}
          onOpenChange={setShowLeftDrawer}
        />

        {/* Center/Right: Map + Verified Command */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="touch-target-lg h-11 w-11 md:hidden"
                onClick={() => setShowLeftDrawer(true)}
                aria-label="Open unverified stream"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("touch-target-lg h-11 w-11", showMap && "bg-secondary")}
                onClick={() => setShowMap(!showMap)}
                aria-label={showMap ? "Hide map" : "Show map"}
                aria-pressed={showMap}
              >
                <Map className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="touch-target-lg min-h-[44px] gap-2 bg-transparent"
                onClick={() => setShowMeshVisualizer(true)}
                aria-label="Open mesh network visualizer"
              >
                <Wifi className="h-4 w-4" />
                <span className="hidden sm:inline">Mesh Network</span>
              </Button>
              <SettingsPanel />
            </div>
          </div>

          {/* Content Grid */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {/* Map */}
            {showMap && !batterySaverMode && (
              <div className="h-[250px] border-b border-border/50 lg:h-full lg:flex-1 lg:border-b-0 lg:border-r">
                <CrisisErrorBoundary>
                  <CrisisMap
                    incidents={incidents}
                    onSelectIncident={setSelectedIncident}
                    className="h-full w-full"
                  />
                </CrisisErrorBoundary>
              </div>
            )}

            {/* Battery saver map placeholder */}
            {showMap && batterySaverMode && (
              <div className="flex h-[250px] items-center justify-center border-b border-border/50 bg-muted lg:h-full lg:flex-1 lg:border-b-0 lg:border-r">
                <p className="text-muted-foreground text-sm">Map disabled in Battery Saver mode</p>
              </div>
            )}

            {/* Verified Command */}
            <div className={cn("flex-1 overflow-hidden", showMap ? "lg:w-[400px] lg:flex-none" : "")}>
              <CrisisErrorBoundary>
                <VerifiedCommand
                  incidents={incidents}
                  onSelectIncident={setSelectedIncident}
                />
              </CrisisErrorBoundary>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="flex items-center justify-around border-t border-border bg-card px-4 py-2 md:hidden" aria-label="Mobile navigation">
        <Button
          variant="ghost"
          size="sm"
          className="touch-target-lg flex-col gap-1"
          onClick={() => setShowLeftDrawer(true)}
        >
          <PanelLeft className="h-5 w-5" />
          <span className="text-xs">Stream</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("touch-target-lg flex-col gap-1", showMap && "text-primary")}
          onClick={() => setShowMap(!showMap)}
        >
          <Map className="h-5 w-5" />
          <span className="text-xs">Map</span>
        </Button>
        {/* SOS takes middle position - handled by floating button */}
        <div className="w-16" /> {/* Spacer for floating SOS button */}
        <Button
          variant="ghost"
          size="sm"
          className="touch-target-lg flex-col gap-1"
          onClick={() => setShowMeshVisualizer(true)}
        >
          <Wifi className="h-5 w-5" />
          <span className="text-xs">Mesh</span>
        </Button>
      </nav>

      {/* SOS Button */}
      <SOSButton onSubmit={handleSOSSubmit} />

      {/* Verification Panel (Slide-in) */}
      {selectedIncident && (
        <CrisisErrorBoundary
          fallbackComponent={
            <VerificationErrorFallback
              onRetry={() => setSelectedIncident(selectedIncident)}
              onManualReview={() => {
                setSelectedIncident(null);
              }}
            />
          }
        >
          <VerificationPanel
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onVerify={handleVerifyIncident}
            onDebunk={handleDebunkIncident}
            onRequestReview={(id) => {
              setSelectedIncident(null);
            }}
          />
        </CrisisErrorBoundary>
      )}

      {/* Mesh Visualizer Modal */}
      {!batterySaverMode && (
        <MeshVisualizer
          nodes={mockMeshNodes}
          connections={mockMeshConnections}
          stats={mockNetworkStats}
          isOpen={showMeshVisualizer}
          onClose={() => setShowMeshVisualizer(false)}
        />
      )}

      {/* Confirmation Modals */}
      <FlagFalseConfirmation
        isOpen={showFlagConfirm}
        onClose={() => {
          setShowFlagConfirm(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmDebunk}
      />

      <VerifyConfirmation
        isOpen={showVerifyConfirm}
        onClose={() => {
          setShowVerifyConfirm(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmVerify}
      />
    </div>
  );
}

export default function CrisisOSDashboard() {
  return (
    <AccessibilityProvider>
      <CrisisOSDashboardContent />
    </AccessibilityProvider>
  );
}
