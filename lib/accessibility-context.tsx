"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AccessibilitySettings {
  highContrastMode: boolean;
  reducedMotion: boolean;
  batterySaverMode: boolean;
  rtlMode: boolean;
  locale: string;
}

interface AccessibilityContextType extends AccessibilitySettings {
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleBatterySaver: () => void;
  toggleRtl: () => void;
  setLocale: (locale: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrastMode: false,
  reducedMotion: false,
  batterySaverMode: false,
  rtlMode: false,
  locale: "en",
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

const RTL_LOCALES = ["ar", "he", "fa", "ur", "ps"]; // Arabic, Hebrew, Farsi, Urdu, Pashto

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Detect system preferences on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }

    // Check for prefers-contrast
    const contrastQuery = window.matchMedia("(prefers-contrast: more)");
    if (contrastQuery.matches) {
      setSettings((prev) => ({ ...prev, highContrastMode: true }));
    }

    // Load saved preferences
    try {
      const saved = localStorage.getItem("crisis-accessibility");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    if (typeof document === "undefined") return;

    const html = document.documentElement;

    // High contrast mode
    if (settings.highContrastMode) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }

    // Reduced motion
    if (settings.reducedMotion || settings.batterySaverMode) {
      html.classList.add("reduce-motion");
    } else {
      html.classList.remove("reduce-motion");
    }

    // RTL mode
    if (settings.rtlMode || RTL_LOCALES.includes(settings.locale)) {
      html.dir = "rtl";
      html.classList.add("rtl");
    } else {
      html.dir = "ltr";
      html.classList.remove("rtl");
    }

    // Battery saver
    if (settings.batterySaverMode) {
      html.classList.add("battery-saver");
    } else {
      html.classList.remove("battery-saver");
    }

    // Save to localStorage
    try {
      localStorage.setItem("crisis-accessibility", JSON.stringify(settings));
    } catch {
      // Ignore localStorage errors
    }
  }, [settings]);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({ ...prev, highContrastMode: !prev.highContrastMode }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const toggleBatterySaver = useCallback(() => {
    setSettings((prev) => ({ ...prev, batterySaverMode: !prev.batterySaverMode }));
  }, []);

  const toggleRtl = useCallback(() => {
    setSettings((prev) => ({ ...prev, rtlMode: !prev.rtlMode }));
  }, []);

  const setLocale = useCallback((locale: string) => {
    setSettings((prev) => ({
      ...prev,
      locale,
      rtlMode: RTL_LOCALES.includes(locale),
    }));
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        toggleHighContrast,
        toggleReducedMotion,
        toggleBatterySaver,
        toggleRtl,
        setLocale,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
