"use client";

import { useState, useCallback, useEffect } from "react";
import { LeafletMap } from "@/components/crisis/leaflet-map";
import { QuickActions } from "@/components/crisis/quick-actions";
import { IncidentFeed } from "@/components/crisis/incident-feed";
import { VerificationPanel } from "@/components/crisis/verification-panel";
import { CrisisErrorBoundary } from "@/components/crisis/error-boundary";
import { FlagFalseConfirmation, VerifyConfirmation } from "@/components/crisis/confirmation-modal";
import { mockIncidents, generateRandomIncident } from "@/lib/mock-data";
import type { Incident } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Map,
  List,
  Settings,
  Wifi,
  WifiOff,
  Shield,
  X,
  ChevronUp,
  Phone,
  Bell,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ViewMode = "map" | "list";

export default function CrisisOSDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSOSExpanded, setShowSOSExpanded] = useState(false);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  const [newIncidentCount, setNewIncidentCount] = useState(0);

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

  // Realtime incident simulation
  useEffect(() => {
    if (!isRealtimeEnabled || !isOnline) return;

    const interval = setInterval(() => {
      const newIncident = generateRandomIncident();
      setIncidents((prev) => [newIncident, ...prev.slice(0, 49)]); // Keep max 50 incidents
      setNewIncidentCount((prev) => prev + 1);

      // Reset new count after 3 seconds
      setTimeout(() => setNewIncidentCount((prev) => Math.max(0, prev - 1)), 3000);
    }, 15000); // New incident every 15 seconds

    return () => clearInterval(interval);
  }, [isRealtimeEnabled, isOnline]);

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
      setShowSOSExpanded(false);

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
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-700 font-medium">
            You are offline. Some features may be limited.
          </span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-gray-900">SafeZone</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Realtime Indicator */}
          {isRealtimeEnabled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 border border-green-200">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700">Live</span>
              {newIncidentCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                  +{newIncidentCount}
                </span>
              )}
            </div>
          )}

          {/* Critical Alert Badge */}
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-700">
                {criticalCount} Critical
              </span>
            </div>
          )}

          {/* Connection Status */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              isOnline ? "bg-green-100" : "bg-gray-100"
            )}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-500" />
            )}
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* View Toggle */}
        <div className="px-4 py-3 flex items-center gap-2 bg-white border-b border-gray-200">
          <div className="flex rounded-xl bg-gray-100 p-1 flex-1 max-w-xs">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                viewMode === "map"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Map className="h-4 w-4" />
              Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="h-4 w-4" />
              List ({incidents.length})
            </button>
          </div>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
            onClick={() => window.open("tel:911")}
          >
            <Phone className="h-4 w-4 text-red-500" />
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
              <div className="absolute bottom-0 left-0 right-0 lg:hidden z-30 pointer-events-none">
                <div className="bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-4 px-4 pointer-events-auto">
                  {!showSOSExpanded ? (
                    <button
                      type="button"
                      onClick={() => setShowSOSExpanded(true)}
                      className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      Report Emergency
                      <ChevronUp className="h-5 w-5 ml-auto" />
                    </button>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">What do you need help with?</h3>
                        <button
                          type="button"
                          onClick={() => setShowSOSExpanded(false)}
                          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
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
            <div className="flex-1 overflow-hidden bg-white">
              <IncidentFeed
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
              />
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-[400px] lg:flex-col lg:border-l lg:border-gray-200 bg-white">
            {/* Quick Actions */}
            <div className="border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Report an Incident</h3>
                <p className="text-sm text-gray-500">
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
      <nav className="lg:hidden flex items-center justify-around border-t border-gray-200 bg-white px-2 py-2 safe-area-inset-bottom">
        <button
          type="button"
          onClick={() => setViewMode("map")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors",
            viewMode === "map" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Map className="h-5 w-5" />
          <span className="text-xs font-medium">Map</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors relative",
            viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <List className="h-5 w-5" />
          <span className="text-xs font-medium">Incidents</span>
          {newIncidentCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {newIncidentCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs font-medium">Settings</span>
        </button>
      </nav>

      {/* Verification Panel - High z-index */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50">
          <CrisisErrorBoundary>
            <VerificationPanel
              incident={selectedIncident}
              onClose={() => setSelectedIncident(null)}
              onVerify={handleVerifyIncident}
              onDebunk={handleDebunkIncident}
              onRequestReview={() => setSelectedIncident(null)}
            />
          </CrisisErrorBoundary>
        </div>
      )}

      {/* Settings Sheet - High z-index */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-full max-w-md z-[60]">
          <SheetHeader>
            <SheetTitle className="text-gray-900">Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Realtime Toggle */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className={cn("h-5 w-5", isRealtimeEnabled ? "text-green-600" : "text-gray-400")} />
                  <div>
                    <p className="font-medium text-gray-900">Live Updates</p>
                    <p className="text-sm text-gray-500">
                      {isRealtimeEnabled ? "Receiving new incidents" : "Updates paused"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRealtimeEnabled(!isRealtimeEnabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    isRealtimeEnabled ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                      isRealtimeEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Connection Status</p>
                    <p className="text-sm text-gray-500">
                      {isOnline ? "Connected to network" : "Offline mode"}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Your Location</p>
                  {userLocation ? (
                    <p className="text-sm text-gray-500 font-mono">
                      {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600">Not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Incident Stats */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="h-5 w-5 text-blue-600" />
                <p className="font-medium text-gray-900">Incident Statistics</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-red-200">
                  <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                  <p className="text-xs text-gray-500">Critical</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                  <p className="text-2xl font-bold text-green-600">
                    {incidents.filter((i) => i.status === "verified").length}
                  </p>
                  <p className="text-xs text-gray-500">Verified</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-amber-200">
                  <p className="text-2xl font-bold text-amber-600">
                    {incidents.filter((i) => i.status === "unconfirmed").length}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Emergency Contacts</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => window.open("tel:911")}
                  className="w-full flex items-center gap-3 h-14 rounded-xl border border-gray-200 px-4 hover:bg-gray-50 transition-colors"
                >
                  <Phone className="h-5 w-5 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Emergency Services</p>
                    <p className="text-xs text-gray-500">911</p>
                  </div>
                </button>
              </div>
            </div>

            {/* About */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                SafeZone v1.0 - Civilian Crisis Coordination
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                Stay safe. Help others. Report emergencies.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Modals - Highest z-index */}
      <div className="relative z-[70]">
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
    </div>
  );
}
