"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class CrisisErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[CrisisOS Error]", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div
          className="flex h-full flex-col items-center justify-center p-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crisis-critical/10">
            <AlertTriangle className="h-8 w-8 text-crisis-critical" />
          </div>
          <h2 className="mb-2 font-semibold text-foreground text-lg">
            Something Went Wrong
          </h2>
          <p className="mb-6 max-w-[280px] text-muted-foreground text-sm">
            The verification system encountered an error. Your data is safe and
            queued for processing.
          </p>
          <Button
            onClick={this.handleRetry}
            className="touch-target-lg min-h-[56px] bg-primary text-primary-foreground"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Verification Error Fallback
export function VerificationErrorFallback({
  onRetry,
  onManualReview,
}: {
  onRetry: () => void;
  onManualReview: () => void;
}) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crisis-warning/10">
        <AlertTriangle className="h-8 w-8 text-crisis-warning" />
      </div>
      <h2 className="mb-2 font-semibold text-foreground text-lg">
        AI Verification Unavailable
      </h2>
      <p className="mb-6 max-w-[280px] text-muted-foreground text-sm">
        Automated verification is temporarily unavailable. You can retry or
        request manual human review.
      </p>
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        <Button
          onClick={onRetry}
          className="touch-target-lg min-h-[56px] w-full bg-primary text-primary-foreground"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry AI Verification
        </Button>
        <Button
          variant="outline"
          onClick={onManualReview}
          className="touch-target-lg min-h-[56px] w-full bg-transparent"
        >
          <Users className="mr-2 h-4 w-4" />
          Request Human Review
        </Button>
      </div>
    </div>
  );
}

// Network Error Toast
export function NetworkErrorToast({
  onRetry,
  onDismiss,
}: {
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 md:left-auto md:right-4 md:w-96"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-lg border border-crisis-critical/30 bg-crisis-critical/10 px-4 py-3 shadow-lg">
        <AlertTriangle className="h-5 w-5 shrink-0 text-crisis-critical" />
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">
            Connection Error
          </p>
          <p className="text-muted-foreground text-xs">
            Message queued for sync when online
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-8 px-2 text-crisis-critical"
          >
            Retry
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 text-muted-foreground"
          >
            <span className="sr-only">Dismiss</span>
            <ChevronRight className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
}
