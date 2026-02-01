"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";
import {
  Maximize2,
  Minimize2,
  Crosshair,
  Layers,
  Navigation,
  Loader2,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import L from "leaflet";

// Leaflet CSS is loaded via CDN in the component
declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showSatellite, setShowSatellite] = useState(false);

  // Load Leaflet scripts
  useEffect(() => {
    if (typeof window !== "undefined" && !window.L) {
      // Load CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => setIsMapReady(true);
      document.head.appendChild(script);
    } else if (window.L) {
      setIsMapReady(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([31.5, 34.47], 10);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // OpenStreetMap tile layer (light style for better visibility)
    const osmLight = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    );

    // Satellite layer
    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 19,
      }
    );

    osmLight.addTo(map);

    // Store layers for switching
    (map as L.Map & { _layers: { osm: L.TileLayer; satellite: L.TileLayer } })._layers = {
      osm: osmLight,
      satellite: satellite,
    };

    // Create marker layer group
    markersRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isMapReady]);

  // Update incident markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !isMapReady) return;

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
          <div class="relative ${pulseClass}">
            <div class="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style="background-color: ${color}; box-shadow: 0 0 12px ${color}80;">
              <div class="w-3 h-3 rounded-full bg-white"></div>
            </div>
            ${incident.severity === "critical" ? `<div class="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 animate-ping" style="border-color: ${color}; opacity: 0.5;"></div>` : ""}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([incident.location.lat, incident.location.lng], {
        icon,
      });

      marker.on("click", () => {
        onSelectIncident?.(incident);
      });

      // Create popup
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <div class="font-semibold text-sm mb-1">${incident.title}</div>
          <div class="text-xs text-gray-400 mb-2">${incident.category} - ${incident.severity}</div>
          <div class="flex gap-2">
            <span class="px-2 py-0.5 rounded text-xs" style="background-color: ${color}20; color: ${color};">${incident.status}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "dark-popup",
        closeButton: false,
      });

      markersRef.current?.addLayer(marker);
    });
  }, [incidents, isMapReady, onSelectIncident]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationStatus("loading");
    setLocationError(null);

    // First get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setUserLocation({ lat, lng });
        setLocationStatus("success");
        onLocationUpdate?.({ lat, lng });

        // Update map view
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
          updateUserMarker(lat, lng);
        }

        // Start watching position
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
          (error) => {
            console.log("[v0] Location watch error:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
      },
      (error) => {
        setLocationStatus("error");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus("denied");
            setLocationError("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [onLocationUpdate]);

  // Update user marker on map
  const updateUserMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !isMapReady) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `
          <div class="relative">
            <div class="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 border-3 border-white shadow-lg flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <div class="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-blue-500/20 animate-ping"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(
        mapInstanceRef.current
      );

      userMarkerRef.current.bindPopup(
        `<div class="p-2 text-sm font-medium">Your Location</div>`,
        { className: "dark-popup", closeButton: false }
      );
    }
  }, [isMapReady]);

  // Center on user
  const centerOnUser = useCallback(() => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15, {
        animate: true,
      });
    } else {
      getUserLocation();
    }
  }, [userLocation, getUserLocation]);

  // Toggle satellite view
  const toggleSatellite = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current as L.Map & {
      _layers: { osm: L.TileLayer; satellite: L.TileLayer };
    };

    if (showSatellite) {
      map._layers.satellite.remove();
      map._layers.osm.addTo(map);
    } else {
      map._layers.osm.remove();
      map._layers.satellite.addTo(map);
    }

    setShowSatellite(!showSatellite);
  }, [showSatellite]);

  // Request location on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      getUserLocation();
    }, 1000);
    return () => clearTimeout(timer);
  }, [getUserLocation]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-card",
        isExpanded ? "fixed inset-4 z-50" : "",
        className
      )}
    >
      {/* Map Container */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Loading State */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Location Status Banner */}
      {locationStatus === "denied" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
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
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Minimize map" : "Maximize map"}
        >
          {isExpanded ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "h-12 w-12 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-700",
            showSatellite && "ring-2 ring-blue-500 bg-blue-50"
          )}
          onClick={toggleSatellite}
          aria-label={showSatellite ? "Show street map" : "Show satellite view"}
        >
          <Layers className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "h-12 w-12 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-700",
            locationStatus === "loading" && "animate-pulse",
            userLocation && "ring-2 ring-blue-500 bg-blue-50"
          )}
          onClick={centerOnUser}
          disabled={locationStatus === "loading"}
          aria-label="Center on my location"
        >
          {locationStatus === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Navigation className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-lg border border-gray-200">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-800">{incidents.length} incidents</span>
          <span className="text-gray-400">|</span>
          <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
            {incidents.filter((i) => i.severity === "critical").length} critical
          </Badge>
        </div>
      </div>

      {/* User Location Display */}
      {userLocation && (
        <div className="absolute bottom-20 left-3 z-10">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg border border-gray-200">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono text-gray-600">
              {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-lg border border-gray-200 text-xs text-gray-700">
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

      {/* Custom Popup Styles for Light Map */}
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: white;
          color: #1a1a2e;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .dark-popup .leaflet-popup-tip {
          background: white;
          border: 1px solid #e5e7eb;
        }
        .dark-popup .leaflet-popup-content {
          color: #1a1a2e;
        }
        .dark-popup .leaflet-popup-content .text-gray-400 {
          color: #6b7280 !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #1a1a2e !important;
          border-color: #e5e7eb !important;
          font-weight: 600 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
        }
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.9) !important;
          color: #6b7280 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #3b82f6 !important;
        }
        .pulse-marker {
          animation: marker-pulse 2s ease-out infinite;
        }
        @keyframes marker-pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        /* Improve marker visibility on light map */
        .custom-marker > div > div {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
        }
        .user-location-marker > div > div:first-child {
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5) !important;
        }
      `}</style>
    </div>
  );
}
