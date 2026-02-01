"use client";

import { useState, useCallback, useEffect } from "react";
import { LeafletMap } from "@/components/crisis/leaflet-map";
import { QuickActions } from "@/components/crisis/quick-actions";
import { IncidentFeed } from "@/components/crisis/incident-feed";
import { VerificationPanel } from "@/components/crisis/verification-panel";
import { CrisisErrorBoundary } from "@/components/crisis/error-boundary";
import { FlagFalseConfirmation, VerifyConfirmation } from "@/components/crisis/confirmation-modal";
import { mockIncidents } from "@/lib/mock-data";
import type { Incident } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Map,
  List,
  Menu,
  Settings,
  Wifi,
  WifiOff,
  Bell,
  Shield,
  X,
  ChevronUp,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ViewMode = "map" | "list";

export default function CrisisOSDashboard() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSOSExpanded, setShowSOSExpanded] = useState(false);

  // Confirmation modals
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; id: string } | null>(null);

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLocationUpdate = useCallback((location: { lat: number; lng: number }) => {
    setUserLocation(location);
  }, []);

  const handleReportIncident = useCallback(
    (type: string, location: { lat: number; lng: number } | null) => {
      const newIncident: Incident = {
        id: `inc-${Date.now()}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Emergency Reported`,
        description: `A ${type} emergency has been reported by a user.`,
        location: location || { lat: 31.5, lng: 34.47 },
        status: "unconfirmed",
        severity: type === "medical" || type === "security" ? "critical" : "medium",
        category: type as Incident["category"],
        source: { type: "direct", authorityScore: 60 },
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
    },
    []
  );

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

  const criticalCount = incidents.filter((i) => i.severity === "critical").length;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Network Status Banner */}
      {!isOnline && (
        <div className="bg-crisis-warning/20 border-b border-crisis-warning/30 px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4 text-crisis-warning" />
          <span className="text-sm text-crisis-warning font-medium">
            You are offline. Some features may be limited.
          </span>
        </div>
      )}

      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">SafeZone</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Critical Alert Badge */}
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-crisis-critical/20 border border-crisis-critical/30">
              <div className="h-2 w-2 rounded-full bg-crisis-critical animate-pulse" />
              <span className="text-sm font-medium text-crisis-critical">
                {criticalCount} Critical
              </span>
            </div>
          )}

          {/* Connection Status */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              isOnline ? "bg-crisis-success/20" : "bg-muted"
            )}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4 text-crisis-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* View Toggle */}
        <div className="px-4 py-3 flex items-center gap-2 bg-background border-b border-border">
          <div className="flex rounded-xl bg-muted p-1 flex-1 max-w-xs">
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                viewMode === "map"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Map className="h-4 w-4" />
              Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl bg-transparent"
            onClick={() => window.open("tel:911")}
          >
            <Phone className="h-4 w-4 text-crisis-critical" />
            <span className="hidden sm:inline">Emergency Call</span>
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Map View */}
          {viewMode === "map" && (
            <div className="flex-1 relative">
              <CrisisErrorBoundary>
                <LeafletMap
                  incidents={incidents}
                  onSelectIncident={setSelectedIncident}
                  onLocationUpdate={handleLocationUpdate}
                  className="h-full w-full"
                />
              </CrisisErrorBoundary>

              {/* Floating Quick Actions on Map */}
              <div className="absolute bottom-0 left-0 right-0 lg:hidden">
                <div className="bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-4 px-4">
                  {!showSOSExpanded ? (
                    <Button
                      onClick={() => setShowSOSExpanded(true)}
                      className="w-full h-14 rounded-2xl bg-crisis-critical hover:bg-crisis-critical/90 text-white font-semibold text-lg gap-2 shadow-lg"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      Report Emergency
                      <ChevronUp className="h-5 w-5 ml-auto" />
                    </Button>
                  ) : (
                    <div className="bg-card rounded-2xl border border-border shadow-xl">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold">What do you need help with?</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setShowSOSExpanded(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <QuickActions
                        onReportIncident={handleReportIncident}
                        userLocation={userLocation}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="flex-1 overflow-hidden">
              <IncidentFeed
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
              />
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-[400px] lg:flex-col lg:border-l lg:border-border">
            {/* Quick Actions */}
            <div className="border-b border-border">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold">Report an Incident</h3>
                <p className="text-sm text-muted-foreground">
                  Select the type of emergency you need help with
                </p>
              </div>
              <QuickActions
                onReportIncident={handleReportIncident}
                userLocation={userLocation}
              />
            </div>

            {/* Incident Feed */}
            <div className="flex-1 overflow-hidden">
              <IncidentFeed
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden flex items-center justify-around border-t border-border bg-card px-2 py-2 safe-area-inset-bottom">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-col gap-1 h-auto py-2 px-4 rounded-xl",
            viewMode === "map" && "bg-muted text-primary"
          )}
          onClick={() => setViewMode("map")}
        >
          <Map className="h-5 w-5" />
          <span className="text-xs">Map</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-col gap-1 h-auto py-2 px-4 rounded-xl",
            viewMode === "list" && "bg-muted text-primary"
          )}
          onClick={() => setViewMode("list")}
        >
          <List className="h-5 w-5" />
          <span className="text-xs">Incidents</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-col gap-1 h-auto py-2 px-4 rounded-xl"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </nav>

      {/* Verification Panel */}
      {selectedIncident && (
        <CrisisErrorBoundary>
          <VerificationPanel
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onVerify={handleVerifyIncident}
            onDebunk={handleDebunkIncident}
            onRequestReview={() => setSelectedIncident(null)}
          />
        </CrisisErrorBoundary>
      )}

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Connection Status */}
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-crisis-success" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Connection Status</p>
                    <p className="text-sm text-muted-foreground">
                      {isOnline ? "Connected to network" : "Offline mode"}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    isOnline ? "bg-crisis-success" : "bg-muted-foreground"
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Your Location</p>
                  {userLocation ? (
                    <p className="text-sm text-muted-foreground font-mono">
                      {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                    </p>
                  ) : (
                    <p className="text-sm text-crisis-warning">Not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <h4 className="font-medium mb-3">Emergency Contacts</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-14 rounded-xl gap-3 bg-transparent"
                  onClick={() => window.open("tel:911")}
                >
                  <Phone className="h-5 w-5 text-crisis-critical" />
                  <div className="text-left">
                    <p className="font-medium">Emergency Services</p>
                    <p className="text-xs text-muted-foreground">911</p>
                  </div>
                </Button>
              </div>
            </div>

            {/* About */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                SafeZone v1.0 - Civilian Crisis Coordination
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Stay safe. Help others. Report emergencies.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
