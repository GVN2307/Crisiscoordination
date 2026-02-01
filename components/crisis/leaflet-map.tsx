"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";
import {
  Maximize2,
  Minimize2,
  Layers,
  Navigation,
  Loader2,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LeafletMapProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  className?: string;
}

type LocationStatus = "idle" | "loading" | "success" | "error" | "denied";

export function LeafletMap({
  incidents,
  onSelectIncident,
  onLocationUpdate,
  className,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const leafletRef = useRef<any>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [showSatellite, setShowSatellite] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Check if already loaded
        if ((window as any).L) {
          leafletRef.current = (window as any).L;
          setIsMapReady(true);
          setIsLoading(false);
          return;
        }

        // Load CSS first
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Load JS
        await new Promise<void>((resolve, reject) => {
          if ((window as any).L) {
            resolve();
            return;
          }

          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          script.onload = () => {
            resolve();
          };
          script.onerror = () => {
            reject(new Error("Failed to load Leaflet"));
          };
          document.head.appendChild(script);
        });

        leafletRef.current = (window as any).L;
        setIsMapReady(true);
        setIsLoading(false);
      } catch (error) {
        setLoadError("Failed to load map. Please refresh the page.");
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current || !leafletRef.current) {
      return;
    }

    const L = leafletRef.current;

    try {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([31.5, 34.47], 10);

      // Add zoom control
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Light OpenStreetMap tile layer
      const osmLight = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      );

      // Satellite layer
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 19,
        }
      );

      osmLight.addTo(map);

      // Store layers for switching
      map._customLayers = { osm: osmLight, satellite: satellite };

      // Create marker layer group
      markersRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Force a resize after a short delay
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    } catch (error) {
      console.error("[v0] Map init error:", error);
      setLoadError("Failed to initialize map");
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapReady]);

  // Update incident markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !isMapReady || !leafletRef.current) return;

    const L = leafletRef.current;
    markersRef.current.clearLayers();

    incidents.forEach((incident) => {
      const color =
        incident.severity === "critical"
          ? "#ef4444"
          : incident.severity === "high"
            ? "#f59e0b"
            : incident.status === "resolved"
              ? "#10b981"
              : "#38bdf8";

      const pulseClass = incident.severity === "critical" ? "pulse-marker" : "";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="relative ${pulseClass}" style="width: 32px; height: 32px;">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background-color: ${color};
              box-shadow: 0 2px 10px ${color}80;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: white;"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([incident.location.lat, incident.location.lng], { icon });

      marker.on("click", () => {
        onSelectIncident?.(incident);
      });

      const popupContent = `
        <div style="padding: 8px; min-width: 180px; font-family: system-ui, sans-serif;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1a1a2e;">${incident.title}</div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${incident.category} - ${incident.severity}</div>
          <span style="
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            background-color: ${color}20;
            color: ${color};
          ">${incident.status}</span>
        </div>
      `;

      marker.bindPopup(popupContent, { closeButton: false });
      markersRef.current?.addLayer(marker);
    });
  }, [incidents, isMapReady, onSelectIncident]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setUserLocation({ lat, lng });
        setLocationStatus("success");
        onLocationUpdate?.({ lat, lng });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
          updateUserMarker(lat, lng);
        }

        // Watch position
        if (watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            onLocationUpdate?.({ lat: latitude, lng: longitude });
            updateUserMarker(latitude, longitude);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("error");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [onLocationUpdate]);

  // Update user marker
  const updateUserMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !isMapReady || !leafletRef.current) return;

    const L = leafletRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #3b82f6;
              border: 3px solid white;
              box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: rgba(59, 130, 246, 0.2);
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(
        mapInstanceRef.current
      );

      userMarkerRef.current.bindPopup(
        '<div style="padding: 8px; font-weight: 500; color: #1a1a2e;">Your Location</div>',
        { closeButton: false }
      );
    }
  }, [isMapReady]);

  // Center on user
  const centerOnUser = useCallback(() => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    } else {
      getUserLocation();
    }
  }, [userLocation, getUserLocation]);

  // Toggle satellite view
  const toggleSatellite = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    if (showSatellite) {
      map._customLayers.satellite.remove();
      map._customLayers.osm.addTo(map);
    } else {
      map._customLayers.osm.remove();
      map._customLayers.satellite.addTo(map);
    }
    setShowSatellite(!showSatellite);
  }, [showSatellite]);

  // Request location on mount
  useEffect(() => {
    if (!isMapReady) return;
    const timer = setTimeout(() => getUserLocation(), 1500);
    return () => clearTimeout(timer);
  }, [isMapReady, getUserLocation]);

  // Handle window resize
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener("resize", handleResize);
    
    // Also handle orientation change for mobile
    const handleOrientationChange = () => {
      setTimeout(handleResize, 200);
    };
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [isMapReady]);

  // Invalidate map size when expanded/collapsed
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Small delay to let CSS transition complete
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Retry loading
  const handleRetry = () => {
    setLoadError(null);
    setIsLoading(true);
    window.location.reload();
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gray-100",
        isExpanded ? "fixed inset-4 z-40" : "",
        className
      )}
    >
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="h-full w-full" 
        style={{ minHeight: "400px", background: "#e5e7eb" }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="text-sm text-gray-600">{loadError}</p>
            <Button onClick={handleRetry} variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Location Denied Banner */}
      {locationStatus === "denied" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <span>Location access denied</span>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs bg-white text-red-600 hover:bg-gray-100"
              onClick={getUserLocation}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {isMapReady && !loadError && (
        <>
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            <Button
              size="icon"
              variant="secondary"
              className="h-11 w-11 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-11 w-11 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-700",
                showSatellite && "ring-2 ring-blue-500 bg-blue-50"
              )}
              onClick={toggleSatellite}
            >
              <Layers className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-11 w-11 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-700",
                locationStatus === "loading" && "animate-pulse",
                userLocation && "ring-2 ring-blue-500 bg-blue-50"
              )}
              onClick={centerOnUser}
              disabled={locationStatus === "loading"}
            >
              {locationStatus === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Navigation className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Stats Overlay */}
          <div className="absolute top-3 left-3 z-20">
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg border border-gray-200">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-800">{incidents.length} incidents</span>
              <span className="text-gray-300">|</span>
              <Badge variant="outline" className="border-red-400 text-red-600 bg-red-50 text-xs">
                {incidents.filter((i) => i.severity === "critical").length} critical
              </Badge>
            </div>
          </div>

          {/* User Location Display */}
          {userLocation && (
            <div className="absolute bottom-20 left-3 z-20">
              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg border border-gray-200">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-mono text-gray-600">
                  {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                </span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-20">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-lg border border-gray-200 text-xs text-gray-700">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-sky-500" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>Resolved</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        .pulse-marker {
          animation: marker-pulse 2s ease-out infinite;
        }
        @keyframes marker-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
        }
        .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #374151 !important;
          border: 1px solid #e5e7eb !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-weight: 600 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
        }
        .leaflet-control-zoom-in {
          border-radius: 8px 8px 0 0 !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.9) !important;
          color: #6b7280 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
}
