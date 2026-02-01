"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/lib/accessibility-context";
import {
  Settings,
  X,
  Sun,
  Moon,
  Battery,
  Languages,
  Eye,
  Vibrate,
  Globe,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LOCALE_OPTIONS = [
  { code: "en", name: "English", native: "English" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "uk", name: "Ukrainian", native: "Українська" },
  { code: "ps", name: "Pashto", native: "پښتو" },
  { code: "fa", name: "Farsi", native: "فارسی" },
  { code: "ur", name: "Urdu", native: "اردو" },
];

export function SettingsPanel() {
  const {
    highContrastMode,
    reducedMotion,
    batterySaverMode,
    rtlMode,
    locale,
    toggleHighContrast,
    toggleReducedMotion,
    toggleBatterySaver,
    setLocale,
  } = useAccessibility();

  const [showLocaleMenu, setShowLocaleMenu] = useState(false);

  const currentLocale = LOCALE_OPTIONS.find((l) => l.code === locale) || LOCALE_OPTIONS[0];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="touch-target-lg h-10 w-10"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Accessibility Section */}
          <section aria-labelledby="accessibility-heading">
            <h3 id="accessibility-heading" className="mb-4 font-semibold text-foreground text-sm">
              Accessibility
            </h3>
            <div className="space-y-4">
              {/* High Contrast Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Eye className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">High Contrast</p>
                    <p className="text-muted-foreground text-xs">Better outdoor visibility</p>
                  </div>
                </div>
                <Switch
                  checked={highContrastMode}
                  onCheckedChange={toggleHighContrast}
                  aria-label="Toggle high contrast mode"
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Vibrate className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Reduce Motion</p>
                    <p className="text-muted-foreground text-xs">Minimize animations</p>
                  </div>
                </div>
                <Switch
                  checked={reducedMotion}
                  onCheckedChange={toggleReducedMotion}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </div>
          </section>

          {/* Performance Section */}
          <section aria-labelledby="performance-heading">
            <h3 id="performance-heading" className="mb-4 font-semibold text-foreground text-sm">
              Performance
            </h3>
            <div className="space-y-4">
              {/* Battery Saver */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      batterySaverMode ? "bg-crisis-success/20" : "bg-secondary"
                    )}
                  >
                    <Battery
                      className={cn(
                        "h-5 w-5",
                        batterySaverMode ? "text-crisis-success" : "text-foreground"
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Battery Saver</p>
                    <p className="text-muted-foreground text-xs">
                      Extends battery by ~40%
                    </p>
                  </div>
                </div>
                <Switch
                  checked={batterySaverMode}
                  onCheckedChange={toggleBatterySaver}
                  aria-label="Toggle battery saver mode"
                />
              </div>
            </div>
          </section>

          {/* Language Section */}
          <section aria-labelledby="language-heading">
            <h3 id="language-heading" className="mb-4 font-semibold text-foreground text-sm">
              Language & Region
            </h3>
            <button
              onClick={() => setShowLocaleMenu(!showLocaleMenu)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:bg-secondary"
              aria-expanded={showLocaleMenu}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Languages className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">{currentLocale.name}</p>
                  <p className="text-muted-foreground text-xs">{currentLocale.native}</p>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  showLocaleMenu && "rotate-90"
                )}
              />
            </button>

            {showLocaleMenu && (
              <div className="mt-2 space-y-1 rounded-lg border border-border bg-secondary/30 p-2">
                {LOCALE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => {
                      setLocale(option.code);
                      setShowLocaleMenu(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors",
                      locale === option.code
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    <span className="text-sm">{option.name}</span>
                    <span className="text-xs opacity-70">{option.native}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Security Section */}
          <section aria-labelledby="security-heading">
            <h3 id="security-heading" className="mb-4 font-semibold text-foreground text-sm">
              Security
            </h3>
            <div className="rounded-lg border border-crisis-success/30 bg-crisis-success/10 p-3">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-crisis-success" />
                <div>
                  <p className="font-medium text-foreground text-sm">Secure Mesh Active</p>
                  <p className="text-muted-foreground text-xs">
                    TURN relay only - IP protected
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
