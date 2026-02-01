"use client";

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { MeshNode, MeshConnection, NetworkStats } from "@/lib/types";
import {
  Smartphone,
  Radio,
  Wifi,
  WifiOff,
  Plus,
  Minus,
  RefreshCw,
  Settings,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MeshVisualizerProps {
  nodes: MeshNode[];
  connections: MeshConnection[];
  stats: NetworkStats;
  isOpen: boolean;
  onClose: () => void;
}

export function MeshVisualizer({
  nodes,
  connections,
  stats,
  isOpen,
  onClose,
}: MeshVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOfflineSimulation, setIsOfflineSimulation] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [packets, setPackets] = useState<
    { id: string; x: number; y: number; targetX: number; targetY: number; progress: number }[]
  >([]);

  // Animation loop
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setAnimationFrame((prev) => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Simulate packet flow
  useEffect(() => {
    if (!isOpen || isOfflineSimulation) return;
    
    const interval = setInterval(() => {
      // Randomly create a new packet
      if (Math.random() > 0.7 && packets.length < 5) {
        const onlineNodes = nodes.filter((n) => n.status !== "offline");
        if (onlineNodes.length >= 2) {
          const sourceNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
          const targetNode = onlineNodes.filter((n) => 
            n.id !== sourceNode.id && sourceNode.connections.includes(n.id)
          )[0];
          
          if (targetNode) {
            setPackets((prev) => [
              ...prev,
              {
                id: `packet-${Date.now()}`,
                x: sourceNode.position.x,
                y: sourceNode.position.y,
                targetX: targetNode.position.x,
                targetY: targetNode.position.y,
                progress: 0,
              },
            ]);
          }
        }
      }

      // Update packet positions
      setPackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + 0.05 }))
          .filter((p) => p.progress < 1)
      );
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, isOfflineSimulation, nodes, packets.length]);

  // Draw the mesh visualization
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid
    ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw connections
    connections.forEach((conn) => {
      const sourceNode = nodes.find((n) => n.id === conn.source);
      const targetNode = nodes.find((n) => n.id === conn.target);
      if (!sourceNode || !targetNode) return;

      // Skip offline connections in simulation
      if (isOfflineSimulation && (sourceNode.status === "offline" || targetNode.status === "offline")) {
        return;
      }

      const gradient = ctx.createLinearGradient(
        sourceNode.position.x,
        sourceNode.position.y,
        targetNode.position.x,
        targetNode.position.y
      );

      // Color based on signal strength
      const alpha = isOfflineSimulation ? 0.3 : (conn.strength / 100) * 0.8;
      const color =
        conn.strength >= 70
          ? `rgba(16, 185, 129, ${alpha})`
          : conn.strength >= 40
            ? `rgba(245, 158, 11, ${alpha})`
            : `rgba(239, 68, 68, ${alpha})`;

      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(1, conn.strength / 30);
      ctx.beginPath();
      ctx.moveTo(sourceNode.position.x, sourceNode.position.y);
      ctx.lineTo(targetNode.position.x, targetNode.position.y);
      ctx.stroke();

      // Animated dash effect for active connections
      if (!isOfflineSimulation && conn.strength > 50) {
        ctx.setLineDash([5, 10]);
        ctx.lineDashOffset = -animationFrame * 2;
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sourceNode.position.x, sourceNode.position.y);
        ctx.lineTo(targetNode.position.x, targetNode.position.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw packets
    packets.forEach((packet) => {
      const x = packet.x + (packet.targetX - packet.x) * packet.progress;
      const y = packet.y + (packet.targetY - packet.y) * packet.progress;

      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw nodes
    nodes.forEach((node) => {
      const { x, y } = node.position;
      const isSelected = selectedNode?.id === node.id;
      const isOffline = node.status === "offline" || (isOfflineSimulation && node.type !== "lora" && node.type !== "bridge");

      // Node glow
      if (!isOffline) {
        const glowColor =
          node.status === "online"
            ? "rgba(16, 185, 129, 0.3)"
            : "rgba(245, 158, 11, 0.3)";
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
        glowGradient.addColorStop(0, glowColor);
        glowGradient.addColorStop(1, "transparent");
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node circle
      ctx.fillStyle = isOffline
        ? "#374151"
        : node.type === "bridge"
          ? "#8b5cf6"
          : node.type === "lora"
            ? "#06b6d4"
            : node.status === "online"
              ? "#10b981"
              : "#f59e0b";

      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 18 : 14, 0, Math.PI * 2);
      ctx.fill();

      // Node border
      ctx.strokeStyle = isSelected ? "#fff" : isOffline ? "#4b5563" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Node icon (simplified)
      ctx.fillStyle = isOffline ? "#6b7280" : "#fff";
      ctx.font = "10px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        node.type === "bridge" ? "B" : node.type === "lora" ? "L" : "P",
        x,
        y
      );

      // Node label
      ctx.fillStyle = isOffline ? "#6b7280" : "#fff";
      ctx.font = "10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(node.id.replace("node-", ""), x, y + 28);

      // Signal strength indicator
      if (!isOffline && node.type !== "bridge") {
        const signalBars = Math.ceil(node.signalStrength / 25);
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = i < signalBars ? "#10b981" : "#374151";
          ctx.fillRect(x - 8 + i * 4, y - 28, 3, 6 + i * 2);
        }
      }
    });
  }, [nodes, connections, packets, animationFrame, selectedNode, isOfflineSimulation]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const clickedNode = nodes.find((node) => {
      const dx = node.position.x - x;
      const dy = node.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    setSelectedNode(clickedNode || null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-strong max-w-4xl border-crisis-info/30 p-0">
        <DialogHeader className="border-b border-border/50 px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-crisis-info">
            <Wifi className="h-5 w-5" />
            Mesh Network Topology
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row">
          {/* Canvas */}
          <div className="relative min-h-[400px] flex-1 lg:min-h-[500px]">
            <canvas
              ref={canvasRef}
              className="h-full w-full cursor-crosshair"
              onClick={handleCanvasClick}
            />

            {/* Controls */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Button
                size="sm"
                variant={isOfflineSimulation ? "destructive" : "secondary"}
                className="glass text-xs"
                onClick={() => setIsOfflineSimulation(!isOfflineSimulation)}
              >
                {isOfflineSimulation ? (
                  <>
                    <WifiOff className="mr-1 h-3 w-3" />
                    Offline Sim
                  </>
                ) : (
                  <>
                    <Wifi className="mr-1 h-3 w-3" />
                    Online
                  </>
                )}
              </Button>
              <Button size="sm" variant="secondary" className="glass text-xs">
                <Plus className="mr-1 h-3 w-3" />
                Add LoRa
              </Button>
            </div>

            {/* Legend */}
            <div className="glass absolute bottom-3 left-3 rounded-lg p-2">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-crisis-success" />
                  <span className="text-foreground">Phone</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-cyan-500" />
                  <span className="text-foreground">LoRa</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-violet-500" />
                  <span className="text-foreground">Bridge</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-gray-500" />
                  <span className="text-foreground">Offline</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="w-full border-t border-border/50 lg:w-64 lg:border-t-0 lg:border-l">
            <div className="p-4">
              <h3 className="mb-4 font-medium text-foreground text-sm">
                Network Statistics
              </h3>

              <div className="space-y-4">
                {/* Nodes */}
                <div className="glass rounded-lg p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Active Nodes</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        stats.onlineNodes > stats.totalNodes / 2
                          ? "border-crisis-success text-crisis-success"
                          : "border-crisis-warning text-crisis-warning"
                      )}
                    >
                      {stats.onlineNodes}/{stats.totalNodes}
                    </Badge>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-crisis-success transition-all"
                      style={{
                        width: `${(stats.onlineNodes / stats.totalNodes) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Latency */}
                <div className="glass rounded-lg p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Avg Latency</span>
                    <span
                      className={cn(
                        "font-mono text-sm",
                        stats.avgLatency < 100
                          ? "text-crisis-success"
                          : stats.avgLatency < 200
                            ? "text-crisis-warning"
                            : "text-crisis-critical"
                      )}
                    >
                      {stats.avgLatency}ms
                    </span>
                  </div>
                </div>

                {/* Sync Status */}
                <div className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Sync Status</span>
                    <div className="flex items-center gap-1">
                      <RefreshCw
                        className={cn(
                          "h-3 w-3",
                          stats.syncStatus === "syncing" && "animate-spin",
                          stats.syncStatus === "synced"
                            ? "text-crisis-success"
                            : "text-crisis-warning"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          stats.syncStatus === "synced"
                            ? "text-crisis-success"
                            : "text-crisis-warning"
                        )}
                      >
                        {stats.syncStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Node Info */}
                {selectedNode && (
                  <div className="glass rounded-lg p-3">
                    <h4 className="mb-2 text-foreground text-xs font-medium">
                      Selected Node
                    </h4>
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID</span>
                        <span className="text-foreground">{selectedNode.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="text-foreground">{selectedNode.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signal</span>
                        <span
                          className={cn(
                            selectedNode.signalStrength >= 70
                              ? "text-crisis-success"
                              : selectedNode.signalStrength >= 40
                                ? "text-crisis-warning"
                                : "text-crisis-critical"
                          )}
                        >
                          {selectedNode.signalStrength}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hops</span>
                        <span className="text-foreground">{selectedNode.hopCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Peers</span>
                        <span className="text-foreground">
                          {selectedNode.connections.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
