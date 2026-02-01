"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { LeafletMap } from "@/components/crisis/leaflet-map";
import { QuickActions } from "@/components/crisis/quick-actions";
import { IncidentFeed } from "@/components/crisis/incident-feed";
import { VerificationPanel } from "@/components/crisis/verification-panel";
import { CrisisErrorBoundary } from "@/components/crisis/error-boundary";
import { FlagFalseConfirmation, VerifyConfirmation } from "@/components/crisis/confirmation-modal";
import { FloatingSOS } from "@/components/crisis/floating-sos";
import { ZoneChat } from "@/components/crisis/zone-chat";
import { StickyStatusIndicator } from "@/components/crisis/sticky-status-indicator";
import { mockIncidents } from "@/lib/mock-data";
import type { Incident } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Map,
  List,
  Settings,
  Wifi,
  WifiOff,
  Shield,
  Phone,
  Bell,
  RefreshCw,
  Globe,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ViewMode = "map" | "list";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CrisisOSDashboard() {
  const [localIncidents, setLocalIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [useLiveData, setUseLiveData] = useState(true);

  // Confirmation modals
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; id: string } | null>(null);

  // Fetch live GDACS data
  const {
    data: liveData,
    error: liveError,
    isLoading: isLoadingLive,
    mutate: refreshLive,
  } = useSWR(useLiveData && isOnline ? "/api/disasters?feed=allWeek" : null, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  // Combine live data with local incidents
  const incidents: Incident[] = [
    ...localIncidents,
    ...(liveData?.incidents || []),
    ...(useLiveData ? [] : mockIncidents), // Use mock data if live is disabled
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);

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
        id: `local-${Date.now()}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Emergency Reported`,
        description: `A ${type} emergency has been reported by a user in need of assistance.`,
        location: location || userLocation || { lat: 31.5, lng: 34.47 },
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

      setLocalIncidents((prev) => [newIncident, ...prev]);

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    },
    [userLocation]
  );

  const handleVerifyIncident = useCallback((id: string) => {
    setPendingAction({ type: "verify", id });
    setShowVerifyConfirm(true);
  }, []);

  const handleConfirmVerify = useCallback(() => {
    if (!pendingAction) return;

    setLocalIncidents((prev) =>
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

    setLocalIncidents((prev) =>
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
  const liveIncidentCount = liveData?.incidents?.length || 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Sticky Connection Status Indicator - Always visible at top */}
      <StickyStatusIndicator />

      {/* Network Status Banner - Additional offline warning */}
      {!isOnline && (
        <div className="bg-amber-600 px-4 py-2 flex items-center justify-center gap-2 min-h-[44px] flex-shrink-0">
          <WifiOff className="h-4 w-4 text-white" />
          <span className="text-sm text-white font-medium">
            You are offline. Showing cached data.
          </span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-gray-900">SafeZone</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Data Status */}
          {useLiveData && isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 border border-green-200">
              {isLoadingLive ? (
                <Loader2 className="h-3 w-3 animate-spin text-green-600" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              )}
              <span className="text-xs font-medium text-green-700">
                {isLoadingLive ? "Loading..." : `${liveIncidentCount} Live`}
              </span>
            </div>
          )}

          {/* Error indicator */}
          {liveError && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span className="text-xs font-medium text-red-700">API Error</span>
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

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100"
            onClick={() => refreshLive()}
            disabled={isLoadingLive || !isOnline}
          >
            <RefreshCw className={cn("h-5 w-5 text-gray-600", isLoadingLive && "animate-spin")} />
          </Button>

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
      <main className="flex-1 flex flex-col relative">
        {/* View Toggle */}
        <div className="px-4 py-3 flex flex-wrap items-center gap-2 bg-white border-b border-gray-200 flex-shrink-0">
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
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Map View */}
          {viewMode === "map" && (
            <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
              <CrisisErrorBoundary>
                <LeafletMap
                  incidents={incidents}
                  onSelectIncident={setSelectedIncident}
                  onLocationUpdate={handleLocationUpdate}
                  className="h-full w-full absolute inset-0"
                />
              </CrisisErrorBoundary>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="flex-1 bg-white overflow-y-auto min-h-[50vh] lg:min-h-0">
              <IncidentFeed
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
              />
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-[400px] lg:flex-col lg:border-l lg:border-gray-200 bg-white lg:max-h-[calc(100vh-180px)] lg:overflow-hidden">
            {/* Quick Actions */}
            <div className="border-b border-gray-200 flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto">
              <IncidentFeed
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden flex items-center justify-around border-t border-gray-200 bg-white px-2 py-2 safe-area-inset-bottom flex-shrink-0 sticky bottom-0 z-30">
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

      {/* Zone-based Local Chat */}
      <ZoneChat userLocation={userLocation} />

      {/* Floating SOS Button - Highest z-index */}
      <FloatingSOS
        onReportIncident={handleReportIncident}
        userLocation={userLocation}
      />

      {/* Verification Panel - Uses Sheet which has z-[60] */}
      <CrisisErrorBoundary>
        <VerificationPanel
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onVerify={handleVerifyIncident}
          onDebunk={handleDebunkIncident}
          onRequestReview={() => setSelectedIncident(null)}
        />
      </CrisisErrorBoundary>

      {/* Confirmation Modals - Highest z-index */}
      <VerifyConfirmation
        isOpen={showVerifyConfirm}
        onClose={() => setShowVerifyConfirm(false)}
        onConfirm={handleConfirmVerify}
      />

      <FlagFalseConfirmation
        isOpen={showFlagConfirm}
        onClose={() => setShowFlagConfirm(false)}
        onConfirm={handleConfirmDebunk}
      />

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-full max-w-md z-[80]">
          <SheetHeader>
            <SheetTitle className="text-gray-900">Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Live Data Toggle */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className={cn("h-5 w-5", useLiveData ? "text-green-600" : "text-gray-400")} />
                  <div>
                    <p className="font-medium text-gray-900">Live GDACS Data</p>
                    <p className="text-sm text-gray-500">
                      {useLiveData ? "Fetching global disaster alerts" : "Using local data only"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseLiveData(!useLiveData)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    useLiveData ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                      useLiveData ? "translate-x-6" : "translate-x-1"
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
                    <p className="text-sm text-amber-600">Not available - allow location access</p>
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
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                  <p className="text-xs text-gray-500">Critical</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-green-600">{liveIncidentCount}</p>
                  <p className="text-xs text-gray-500">Live (GDACS)</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-blue-600">{localIncidents.length}</p>
                  <p className="text-xs text-gray-500">Local Reports</p>
                </div>
              </div>
            </div>

            {/* Data Source Info */}
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Data Sources</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Live disaster data from GDACS (Global Disaster Alert and Coordination System).
                    Updated every 6 minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="text-center text-xs text-gray-400 pt-4">
              <p>SafeZone Crisis Coordination v1.0</p>
              <p className="mt-1">Built for humanitarian response</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
