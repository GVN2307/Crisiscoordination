// Crisis OS Type Definitions

export type IncidentStatus = "verified" | "unconfirmed" | "debunked" | "resolved";
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentCategory =
  | "medical"
  | "evacuation"
  | "water"
  | "shelter"
  | "food"
  | "infrastructure"
  | "security"
  | "other";

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: IncidentStatus;
  severity: IncidentSeverity;
  category: IncidentCategory;
  imageUrl?: string;
  source: IncidentSource;
  verification: VerificationResult;
  timestamp: number;
  updatedAt: number;
  meshNodeId?: string;
  peerConfirmations: number;
}

export interface IncidentSource {
  type: "telegram" | "whatsapp" | "direct" | "sms" | "mesh";
  userId?: string;
  channelId?: string;
  authorityScore: number; // 0-100
}

export interface VerificationResult {
  score: number; // 0-100
  status: "pending" | "verified" | "unconfirmed" | "debunked";
  checks: VerificationCheck[];
  timestamp: number;
}

export interface VerificationCheck {
  type:
    | "reverse_image"
    | "geolocation"
    | "temporal"
    | "satellite"
    | "peer_confirm";
  passed: boolean;
  confidence: number;
  details?: string;
}

export interface MeshNode {
  id: string;
  type: "phone" | "lora" | "bridge";
  status: "online" | "weak" | "offline";
  signalStrength: number; // 0-100
  position: { x: number; y: number };
  connections: string[];
  lastSeen: number;
  hopCount: number;
}

export interface MeshConnection {
  source: string;
  target: string;
  strength: number;
  latency: number;
}

export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;
  avgLatency: number;
  syncStatus: "synced" | "syncing" | "offline";
  lastSync: number;
}

export interface RawMessage {
  id: string;
  content: string;
  source: "telegram" | "whatsapp";
  timestamp: number;
  author: string;
  hasImage: boolean;
  imageUrl?: string;
  location?: { lat: number; lng: number };
  isProcessing: boolean;
}
