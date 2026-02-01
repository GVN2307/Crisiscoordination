"use client";

import React from "react"

import { AlertTriangle, ShieldOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ConfirmationType = "flag" | "verify" | "delete" | "warning";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: ConfirmationType;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

const typeConfig: Record<
  ConfirmationType,
  {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    confirmColor: string;
  }
> = {
  flag: {
    icon: ShieldOff,
    iconColor: "text-crisis-critical",
    iconBg: "bg-crisis-critical/10",
    confirmColor: "bg-crisis-critical text-foreground hover:bg-crisis-critical/90",
  },
  verify: {
    icon: AlertTriangle,
    iconColor: "text-crisis-success",
    iconBg: "bg-crisis-success/10",
    confirmColor: "bg-crisis-success text-primary-foreground hover:bg-crisis-success/90",
  },
  delete: {
    icon: AlertTriangle,
    iconColor: "text-crisis-critical",
    iconBg: "bg-crisis-critical/10",
    confirmColor: "bg-crisis-critical text-foreground hover:bg-crisis-critical/90",
  },
  warning: {
    icon: Info,
    iconColor: "text-crisis-warning",
    iconBg: "bg-crisis-warning/10",
    confirmColor: "bg-crisis-warning text-primary-foreground hover:bg-crisis-warning/90",
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
}: ConfirmationModalProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-white sm:max-w-md z-[110]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                config.iconBg
              )}
            >
              <Icon className={cn("h-6 w-6", config.iconColor)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-foreground">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-muted-foreground">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="touch-target-lg min-h-[56px] flex-1 bg-transparent sm:flex-none"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn("touch-target-lg min-h-[56px] flex-1 sm:flex-none", config.confirmColor)}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Pre-configured confirmation modals for common actions
export function FlagFalseConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="flag"
      title="Flag as False Information?"
      description="You are flagging this incident as FALSE. This action may delay aid delivery to people in need. Please only flag if you are certain this is misinformation."
      confirmLabel="Yes, Flag as False"
      cancelLabel="Go Back"
      isLoading={isLoading}
    />
  );
}

export function VerifyConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="verify"
      title="Verify This Incident?"
      description="By verifying, you confirm this incident is accurate based on available evidence. This will prioritize it for emergency responders."
      confirmLabel="Verify Incident"
      cancelLabel="Review Again"
      isLoading={isLoading}
    />
  );
}
