// Connection state management for CrisisOS
// Handles online/mesh/isolated states and message queueing

export type ConnectionState = "online" | "mesh" | "isolated";

export interface QueuedMessage {
  id: string;
  type: "sos" | "verification" | "report";
  payload: unknown;
  timestamp: number;
  retries: number;
  status: "queued" | "sending" | "failed";
}

export interface ConnectionStatus {
  state: ConnectionState;
  peerCount: number;
  lastOnline: number;
  lastSync: number;
  queuedMessages: QueuedMessage[];
  isSyncing: boolean;
}

// Initial state
export const initialConnectionStatus: ConnectionStatus = {
  state: "online",
  peerCount: 0,
  lastOnline: Date.now(),
  lastSync: Date.now(),
  queuedMessages: [],
  isSyncing: false,
};

// State labels and colors for UI
export const CONNECTION_LABELS: Record<ConnectionState, { label: string; color: string; description: string }> = {
  online: {
    label: "Online",
    color: "crisis-success",
    description: "Cloud sync active",
  },
  mesh: {
    label: "Mesh Mode",
    color: "crisis-info",
    description: "Peer-to-peer active",
  },
  isolated: {
    label: "Isolated",
    color: "crisis-critical",
    description: "Queueing for sync",
  },
};

// Queue message for later sync
export function queueMessage(
  queue: QueuedMessage[],
  type: QueuedMessage["type"],
  payload: unknown
): QueuedMessage[] {
  const newMessage: QueuedMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    retries: 0,
    status: "queued",
  };

  return [...queue, newMessage];
}

// Process queued messages (simulated)
export async function processQueue(
  queue: QueuedMessage[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ successful: string[]; failed: string[] }> {
  const successful: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < queue.length; i++) {
    const msg = queue[i];
    onProgress?.(i + 1, queue.length);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 90% success rate simulation
    if (Math.random() > 0.1) {
      successful.push(msg.id);
    } else {
      failed.push(msg.id);
    }
  }

  return { successful, failed };
}

// Detect connection state based on network conditions
export function detectConnectionState(
  isOnline: boolean,
  meshPeerCount: number
): ConnectionState {
  if (isOnline) return "online";
  if (meshPeerCount > 0) return "mesh";
  return "isolated";
}
