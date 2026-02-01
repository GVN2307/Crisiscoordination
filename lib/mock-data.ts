import type {
  Incident,
  MeshNode,
  MeshConnection,
  NetworkStats,
  RawMessage,
} from "./types";

export const mockRawMessages: RawMessage[] = [
  {
    id: "raw-1",
    content:
      "URGENT: Road blocked near central hospital, need alternative route immediately!",
    source: "telegram",
    timestamp: Date.now() - 120000,
    author: "Anonymous_42",
    hasImage: true,
    imageUrl: "/placeholder-crisis-1.jpg",
    location: { lat: 31.5, lng: 34.47 },
    isProcessing: false,
  },
  {
    id: "raw-2",
    content: "Water distribution point at school building - unverified",
    source: "whatsapp",
    timestamp: Date.now() - 300000,
    author: "+97254*****",
    hasImage: false,
    isProcessing: true,
  },
  {
    id: "raw-3",
    content:
      "Medical supplies needed at refugee camp sector B, critical shortage of insulin",
    source: "telegram",
    timestamp: Date.now() - 60000,
    author: "MedAid_Volunteer",
    hasImage: true,
    imageUrl: "/placeholder-crisis-2.jpg",
    location: { lat: 31.52, lng: 34.45 },
    isProcessing: false,
  },
  {
    id: "raw-4",
    content:
      "WARNING: Suspicious checkpoint reported on northern highway - avoid!",
    source: "telegram",
    timestamp: Date.now() - 180000,
    author: "SafeRoute_Bot",
    hasImage: false,
    location: { lat: 31.55, lng: 34.5 },
    isProcessing: false,
  },
  {
    id: "raw-5",
    content: "Family of 6 trapped in collapsed building, sending coordinates",
    source: "whatsapp",
    timestamp: Date.now() - 30000,
    author: "+97250*****",
    hasImage: true,
    imageUrl: "/placeholder-crisis-3.jpg",
    location: { lat: 31.48, lng: 34.42 },
    isProcessing: false,
  },
];

// Global incidents from around the world - simulating realtime data
export const mockIncidents: Incident[] = [
  // Gaza Region
  {
    id: "inc-1",
    title: "Road Blockage - Central Hospital Access",
    description:
      "Main access road to central hospital completely blocked by debris. Alternative routes via Eastern bypass recommended.",
    location: { lat: 31.5, lng: 34.47, address: "Al-Rashid Street, Block 7" },
    status: "verified",
    severity: "critical",
    category: "infrastructure",
    imageUrl: "/placeholder-verified-1.jpg",
    source: {
      type: "telegram",
      userId: "user_123",
      authorityScore: 75,
    },
    verification: {
      score: 92,
      status: "verified",
      checks: [
        { type: "reverse_image", passed: true, confidence: 95, details: "No historical matches found" },
        { type: "geolocation", passed: true, confidence: 88, details: "EXIF matches claimed location" },
        { type: "temporal", passed: true, confidence: 90, details: "Shadow analysis confirms current time" },
        { type: "peer_confirm", passed: true, confidence: 100, details: "5 mesh confirmations" },
      ],
      timestamp: Date.now() - 100000,
    },
    timestamp: Date.now() - 120000,
    updatedAt: Date.now() - 50000,
    peerConfirmations: 5,
  },
  {
    id: "inc-2",
    title: "Medical Supply Shortage - Sector B",
    description:
      "Critical shortage of insulin and basic medical supplies at refugee camp sector B. Immediate resupply required.",
    location: { lat: 31.52, lng: 34.45, address: "Refugee Camp, Sector B" },
    status: "verified",
    severity: "critical",
    category: "medical",
    source: {
      type: "direct",
      userId: "ngo_medaid",
      authorityScore: 95,
    },
    verification: {
      score: 88,
      status: "verified",
      checks: [
        { type: "reverse_image", passed: true, confidence: 100, details: "Original photo" },
        { type: "geolocation", passed: true, confidence: 85, details: "Location verified" },
        { type: "peer_confirm", passed: true, confidence: 90, details: "3 NGO confirmations" },
      ],
      timestamp: Date.now() - 50000,
    },
    timestamp: Date.now() - 60000,
    updatedAt: Date.now() - 30000,
    peerConfirmations: 3,
  },
  {
    id: "inc-3",
    title: "Suspicious Checkpoint - Northern Highway",
    description:
      "Unverified reports of suspicious checkpoint on northern highway. Exercise extreme caution.",
    location: { lat: 31.55, lng: 34.5, address: "Northern Highway, KM 12" },
    status: "unconfirmed",
    severity: "high",
    category: "security",
    source: {
      type: "telegram",
      authorityScore: 40,
    },
    verification: {
      score: 45,
      status: "unconfirmed",
      checks: [
        { type: "reverse_image", passed: false, confidence: 0, details: "No image provided" },
        { type: "geolocation", passed: true, confidence: 60, details: "Approximate location" },
        { type: "peer_confirm", passed: false, confidence: 30, details: "1 unverified report" },
      ],
      timestamp: Date.now() - 170000,
    },
    timestamp: Date.now() - 180000,
    updatedAt: Date.now() - 170000,
    peerConfirmations: 1,
  },
  {
    id: "inc-4",
    title: "Water Distribution Active",
    description:
      "Clean water distribution point operational at school building. Capacity: 500 families/day.",
    location: { lat: 31.49, lng: 34.46, address: "Al-Nour School" },
    status: "resolved",
    severity: "medium",
    category: "water",
    source: {
      type: "direct",
      userId: "unicef_field",
      authorityScore: 98,
    },
    verification: {
      score: 95,
      status: "verified",
      checks: [
        { type: "reverse_image", passed: true, confidence: 100 },
        { type: "geolocation", passed: true, confidence: 98 },
        { type: "peer_confirm", passed: true, confidence: 100, details: "NGO verified" },
      ],
      timestamp: Date.now() - 3600000,
    },
    timestamp: Date.now() - 3700000,
    updatedAt: Date.now() - 1800000,
    peerConfirmations: 12,
  },
  {
    id: "inc-5",
    title: "Trapped Family - Building Collapse",
    description:
      "Family of 6 reported trapped in collapsed residential building. Rescue teams dispatched.",
    location: { lat: 31.48, lng: 34.42, address: "Block 15, Building 7" },
    status: "verified",
    severity: "critical",
    category: "evacuation",
    imageUrl: "/placeholder-verified-2.jpg",
    source: {
      type: "whatsapp",
      authorityScore: 60,
    },
    verification: {
      score: 78,
      status: "verified",
      checks: [
        { type: "reverse_image", passed: true, confidence: 85 },
        { type: "geolocation", passed: true, confidence: 75 },
        { type: "satellite", passed: true, confidence: 80, details: "Building damage confirmed" },
        { type: "peer_confirm", passed: true, confidence: 70, details: "2 confirmations" },
      ],
      timestamp: Date.now() - 25000,
    },
    timestamp: Date.now() - 30000,
    updatedAt: Date.now() - 20000,
    peerConfirmations: 2,
  },
  // Ukraine Region
  {
    id: "inc-6",
    title: "Shelter Needed - Kharkiv District",
    description:
      "50+ civilians require emergency shelter after residential area bombing. Children and elderly present.",
    location: { lat: 49.99, lng: 36.23, address: "Kharkiv, Saltivka District" },
    status: "verified",
    severity: "critical",
    category: "shelter",
    source: {
      type: "telegram",
      userId: "ua_civil_defense",
      authorityScore: 90,
    },
    verification: {
      score: 85,
      status: "verified",
      checks: [
        { type: "reverse_image", passed: true, confidence: 88 },
        { type: "geolocation", passed: true, confidence: 82 },
        { type: "peer_confirm", passed: true, confidence: 85, details: "4 local confirmations" },
      ],
      timestamp: Date.now() - 45000,
    },
    timestamp: Date.now() - 55000,
    updatedAt: Date.now() - 40000,
    peerConfirmations: 4,
  },
  {
    id: "inc-7",
    title: "Power Outage - Central Kyiv",
    description:
      "Major power outage affecting hospitals and residential areas. Backup generators running low on fuel.",
    location: { lat: 50.45, lng: 30.52, address: "Kyiv, Shevchenkivskyi District" },
    status: "verified",
    severity: "high",
    category: "infrastructure",
    source: {
      type: "direct",
      userId: "kyiv_emergency",
      authorityScore: 95,
    },
    verification: {
      score: 92,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 95 },
        { type: "peer_confirm", passed: true, confidence: 90, details: "Official source" },
      ],
      timestamp: Date.now() - 120000,
    },
    timestamp: Date.now() - 150000,
    updatedAt: Date.now() - 100000,
    peerConfirmations: 8,
  },
  {
    id: "inc-8",
    title: "Medical Evacuation Required - Odesa",
    description:
      "3 critical patients require medical evacuation. Hospital capacity exceeded.",
    location: { lat: 46.48, lng: 30.73, address: "Odesa Regional Hospital" },
    status: "unconfirmed",
    severity: "critical",
    category: "medical",
    source: {
      type: "whatsapp",
      authorityScore: 55,
    },
    verification: {
      score: 60,
      status: "unconfirmed",
      checks: [
        { type: "geolocation", passed: true, confidence: 70 },
        { type: "peer_confirm", passed: false, confidence: 40, details: "Awaiting verification" },
      ],
      timestamp: Date.now() - 20000,
    },
    timestamp: Date.now() - 25000,
    updatedAt: Date.now() - 15000,
    peerConfirmations: 1,
  },
  // Syria Region
  {
    id: "inc-9",
    title: "Food Distribution Point - Aleppo",
    description:
      "WFP food distribution active at northern checkpoint. Bring ID documents.",
    location: { lat: 36.2, lng: 37.15, address: "Aleppo, Northern District" },
    status: "verified",
    severity: "medium",
    category: "water",
    source: {
      type: "direct",
      userId: "wfp_syria",
      authorityScore: 98,
    },
    verification: {
      score: 98,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 98 },
        { type: "peer_confirm", passed: true, confidence: 100, details: "UN verified" },
      ],
      timestamp: Date.now() - 7200000,
    },
    timestamp: Date.now() - 7300000,
    updatedAt: Date.now() - 3600000,
    peerConfirmations: 25,
  },
  {
    id: "inc-10",
    title: "Unexploded Ordnance Warning - Damascus Suburbs",
    description:
      "UXO reported in residential area. Keep distance, authorities notified.",
    location: { lat: 33.51, lng: 36.28, address: "Eastern Ghouta" },
    status: "verified",
    severity: "critical",
    category: "security",
    source: {
      type: "telegram",
      authorityScore: 80,
    },
    verification: {
      score: 82,
      status: "verified",
      checks: [
        { type: "reverse_image", passed: true, confidence: 75 },
        { type: "geolocation", passed: true, confidence: 85 },
        { type: "peer_confirm", passed: true, confidence: 80, details: "3 confirmations" },
      ],
      timestamp: Date.now() - 90000,
    },
    timestamp: Date.now() - 100000,
    updatedAt: Date.now() - 80000,
    peerConfirmations: 3,
  },
  // Haiti - Post-Earthquake
  {
    id: "inc-11",
    title: "Collapsed School - Port-au-Prince",
    description:
      "School building collapsed in Delmas district. Unknown number of casualties. Rescue teams needed.",
    location: { lat: 18.54, lng: -72.33, address: "Delmas 33, Port-au-Prince" },
    status: "verified",
    severity: "critical",
    category: "evacuation",
    source: {
      type: "whatsapp",
      authorityScore: 65,
    },
    verification: {
      score: 75,
      status: "verified",
      checks: [
        { type: "reverse_image", passed: true, confidence: 80 },
        { type: "satellite", passed: true, confidence: 70, details: "Structural damage visible" },
        { type: "peer_confirm", passed: true, confidence: 75, details: "2 confirmations" },
      ],
      timestamp: Date.now() - 15000,
    },
    timestamp: Date.now() - 18000,
    updatedAt: Date.now() - 10000,
    peerConfirmations: 2,
  },
  {
    id: "inc-12",
    title: "Medical Clinic Operational - Carrefour",
    description:
      "MSF mobile clinic providing free medical care. Treating injuries and distributing medications.",
    location: { lat: 18.53, lng: -72.4, address: "Carrefour, Route National 2" },
    status: "verified",
    severity: "low",
    category: "medical",
    source: {
      type: "direct",
      userId: "msf_haiti",
      authorityScore: 98,
    },
    verification: {
      score: 98,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 98 },
        { type: "peer_confirm", passed: true, confidence: 100, details: "MSF official" },
      ],
      timestamp: Date.now() - 5400000,
    },
    timestamp: Date.now() - 5500000,
    updatedAt: Date.now() - 1800000,
    peerConfirmations: 15,
  },
  // Turkey - Earthquake Zone
  {
    id: "inc-13",
    title: "Survivors Found - Antakya",
    description:
      "Search teams report survivors in collapsed apartment building. Heavy equipment requested.",
    location: { lat: 36.2, lng: 36.16, address: "Antakya, Hatay Province" },
    status: "verified",
    severity: "critical",
    category: "evacuation",
    source: {
      type: "telegram",
      userId: "afad_rescue",
      authorityScore: 92,
    },
    verification: {
      score: 90,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 92 },
        { type: "peer_confirm", passed: true, confidence: 88, details: "Official rescue team" },
      ],
      timestamp: Date.now() - 35000,
    },
    timestamp: Date.now() - 40000,
    updatedAt: Date.now() - 30000,
    peerConfirmations: 6,
  },
  {
    id: "inc-14",
    title: "Tent City Water Shortage - Kahramanmaras",
    description:
      "Displaced persons camp experiencing critical water shortage. 2000+ people affected.",
    location: { lat: 37.58, lng: 36.93, address: "Kahramanmaras Central Camp" },
    status: "verified",
    severity: "high",
    category: "water",
    source: {
      type: "direct",
      userId: "unhcr_turkey",
      authorityScore: 95,
    },
    verification: {
      score: 88,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 90 },
        { type: "peer_confirm", passed: true, confidence: 85, details: "UNHCR confirmed" },
      ],
      timestamp: Date.now() - 80000,
    },
    timestamp: Date.now() - 90000,
    updatedAt: Date.now() - 70000,
    peerConfirmations: 5,
  },
  // Philippines - Typhoon Zone
  {
    id: "inc-15",
    title: "Flash Flood Warning - Leyte",
    description:
      "Severe flooding reported in lowland areas. Evacuate to higher ground immediately.",
    location: { lat: 10.63, lng: 125.0, address: "Tacloban City, Leyte" },
    status: "verified",
    severity: "critical",
    category: "evacuation",
    source: {
      type: "direct",
      userId: "pagasa_warning",
      authorityScore: 98,
    },
    verification: {
      score: 95,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 95 },
        { type: "satellite", passed: true, confidence: 92, details: "Weather radar confirmed" },
        { type: "peer_confirm", passed: true, confidence: 95, details: "Official warning" },
      ],
      timestamp: Date.now() - 10000,
    },
    timestamp: Date.now() - 12000,
    updatedAt: Date.now() - 8000,
    peerConfirmations: 10,
  },
  {
    id: "inc-16",
    title: "Evacuation Center at Full Capacity - Cebu",
    description:
      "Main evacuation center cannot accept more evacuees. Alternative shelters being identified.",
    location: { lat: 10.31, lng: 123.89, address: "Cebu City Sports Complex" },
    status: "verified",
    severity: "high",
    category: "shelter",
    source: {
      type: "telegram",
      authorityScore: 75,
    },
    verification: {
      score: 78,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 80 },
        { type: "peer_confirm", passed: true, confidence: 75, details: "3 local confirmations" },
      ],
      timestamp: Date.now() - 60000,
    },
    timestamp: Date.now() - 70000,
    updatedAt: Date.now() - 55000,
    peerConfirmations: 3,
  },
  // Bangladesh - Rohingya Camps
  {
    id: "inc-17",
    title: "Fire in Camp 4 - Cox's Bazar",
    description:
      "Fire spreading through makeshift shelters. Hundreds displaced. Fire brigade en route.",
    location: { lat: 21.18, lng: 92.17, address: "Kutupalong Camp 4" },
    status: "verified",
    severity: "critical",
    category: "infrastructure",
    source: {
      type: "telegram",
      userId: "iom_cxb",
      authorityScore: 90,
    },
    verification: {
      score: 88,
      status: "verified",
      checks: [
        { type: "reverse_image", passed: true, confidence: 85 },
        { type: "geolocation", passed: true, confidence: 90 },
        { type: "peer_confirm", passed: true, confidence: 88, details: "IOM confirmed" },
      ],
      timestamp: Date.now() - 5000,
    },
    timestamp: Date.now() - 8000,
    updatedAt: Date.now() - 3000,
    peerConfirmations: 7,
  },
  {
    id: "inc-18",
    title: "Cholera Outbreak Alert - Camp 12",
    description:
      "Multiple suspected cholera cases reported. ORS distribution point established.",
    location: { lat: 21.2, lng: 92.15, address: "Camp 12, Block E" },
    status: "unconfirmed",
    severity: "high",
    category: "medical",
    source: {
      type: "whatsapp",
      authorityScore: 60,
    },
    verification: {
      score: 55,
      status: "unconfirmed",
      checks: [
        { type: "geolocation", passed: true, confidence: 65 },
        { type: "peer_confirm", passed: false, confidence: 45, details: "Pending WHO verification" },
      ],
      timestamp: Date.now() - 180000,
    },
    timestamp: Date.now() - 200000,
    updatedAt: Date.now() - 150000,
    peerConfirmations: 2,
  },
  // California Wildfire Zone
  {
    id: "inc-19",
    title: "Mandatory Evacuation - Paradise Valley",
    description:
      "Wildfire approaching residential area. All residents must evacuate via Highway 70.",
    location: { lat: 39.76, lng: -121.62, address: "Paradise, California" },
    status: "verified",
    severity: "critical",
    category: "evacuation",
    source: {
      type: "direct",
      userId: "calfire_official",
      authorityScore: 98,
    },
    verification: {
      score: 98,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 98 },
        { type: "satellite", passed: true, confidence: 95, details: "Fire perimeter confirmed" },
        { type: "peer_confirm", passed: true, confidence: 100, details: "CalFire official" },
      ],
      timestamp: Date.now() - 2000,
    },
    timestamp: Date.now() - 5000,
    updatedAt: Date.now() - 1000,
    peerConfirmations: 20,
  },
  {
    id: "inc-20",
    title: "Emergency Shelter Open - Chico Fairgrounds",
    description:
      "Red Cross shelter accepting evacuees. Pet-friendly. Capacity for 500 people.",
    location: { lat: 39.73, lng: -121.84, address: "Silver Dollar Fairgrounds, Chico" },
    status: "verified",
    severity: "low",
    category: "shelter",
    source: {
      type: "direct",
      userId: "redcross_norcal",
      authorityScore: 98,
    },
    verification: {
      score: 98,
      status: "verified",
      checks: [
        { type: "geolocation", passed: true, confidence: 98 },
        { type: "peer_confirm", passed: true, confidence: 100, details: "Red Cross official" },
      ],
      timestamp: Date.now() - 30000,
    },
    timestamp: Date.now() - 35000,
    updatedAt: Date.now() - 25000,
    peerConfirmations: 12,
  },
];

export const mockMeshNodes: MeshNode[] = [
  {
    id: "node-1",
    type: "phone",
    status: "online",
    signalStrength: 95,
    position: { x: 200, y: 150 },
    connections: ["node-2", "node-3", "node-bridge"],
    lastSeen: Date.now(),
    hopCount: 0,
  },
  {
    id: "node-2",
    type: "phone",
    status: "online",
    signalStrength: 82,
    position: { x: 350, y: 120 },
    connections: ["node-1", "node-4"],
    lastSeen: Date.now() - 5000,
    hopCount: 1,
  },
  {
    id: "node-3",
    type: "phone",
    status: "weak",
    signalStrength: 45,
    position: { x: 150, y: 280 },
    connections: ["node-1", "node-5"],
    lastSeen: Date.now() - 30000,
    hopCount: 1,
  },
  {
    id: "node-4",
    type: "phone",
    status: "online",
    signalStrength: 78,
    position: { x: 480, y: 200 },
    connections: ["node-2", "node-bridge"],
    lastSeen: Date.now() - 2000,
    hopCount: 2,
  },
  {
    id: "node-5",
    type: "lora",
    status: "online",
    signalStrength: 88,
    position: { x: 100, y: 380 },
    connections: ["node-3", "node-6"],
    lastSeen: Date.now() - 1000,
    hopCount: 2,
  },
  {
    id: "node-6",
    type: "phone",
    status: "offline",
    signalStrength: 0,
    position: { x: 50, y: 450 },
    connections: [],
    lastSeen: Date.now() - 120000,
    hopCount: 3,
  },
  {
    id: "node-bridge",
    type: "bridge",
    status: "online",
    signalStrength: 100,
    position: { x: 400, y: 300 },
    connections: ["node-1", "node-4", "node-7"],
    lastSeen: Date.now(),
    hopCount: 0,
  },
  {
    id: "node-7",
    type: "phone",
    status: "weak",
    signalStrength: 35,
    position: { x: 520, y: 380 },
    connections: ["node-bridge"],
    lastSeen: Date.now() - 45000,
    hopCount: 1,
  },
];

export const mockMeshConnections: MeshConnection[] = [
  { source: "node-1", target: "node-2", strength: 85, latency: 45 },
  { source: "node-1", target: "node-3", strength: 55, latency: 120 },
  { source: "node-1", target: "node-bridge", strength: 95, latency: 20 },
  { source: "node-2", target: "node-4", strength: 75, latency: 65 },
  { source: "node-3", target: "node-5", strength: 60, latency: 150 },
  { source: "node-4", target: "node-bridge", strength: 80, latency: 55 },
  { source: "node-5", target: "node-6", strength: 0, latency: 9999 },
  { source: "node-bridge", target: "node-7", strength: 40, latency: 200 },
];

export const mockNetworkStats: NetworkStats = {
  totalNodes: 8,
  onlineNodes: 5,
  avgLatency: 95,
  syncStatus: "synced",
  lastSync: Date.now() - 5000,
};

// Function to generate a random new incident for realtime simulation
export function generateRandomIncident(): Incident {
  const categories = ["medical", "security", "shelter", "water", "evacuation", "infrastructure"] as const;
  const severities = ["critical", "high", "medium", "low"] as const;
  const statuses = ["verified", "unconfirmed"] as const;
  
  const locations = [
    { lat: 31.5 + (Math.random() - 0.5) * 0.2, lng: 34.47 + (Math.random() - 0.5) * 0.2, address: "Gaza Region" },
    { lat: 50.45 + (Math.random() - 0.5) * 0.2, lng: 30.52 + (Math.random() - 0.5) * 0.2, address: "Kyiv, Ukraine" },
    { lat: 36.2 + (Math.random() - 0.5) * 0.2, lng: 37.15 + (Math.random() - 0.5) * 0.2, address: "Aleppo, Syria" },
    { lat: 18.54 + (Math.random() - 0.5) * 0.2, lng: -72.33 + (Math.random() - 0.5) * 0.2, address: "Port-au-Prince, Haiti" },
    { lat: 36.2 + (Math.random() - 0.5) * 0.2, lng: 36.16 + (Math.random() - 0.5) * 0.2, address: "Hatay, Turkey" },
    { lat: 10.63 + (Math.random() - 0.5) * 0.2, lng: 125.0 + (Math.random() - 0.5) * 0.2, address: "Leyte, Philippines" },
    { lat: 21.18 + (Math.random() - 0.5) * 0.2, lng: 92.17 + (Math.random() - 0.5) * 0.2, address: "Cox's Bazar, Bangladesh" },
    { lat: 39.76 + (Math.random() - 0.5) * 0.2, lng: -121.62 + (Math.random() - 0.5) * 0.2, address: "California, USA" },
  ];

  const titles = [
    "Medical Emergency Reported",
    "Security Alert",
    "Shelter Needed Urgently",
    "Water Supply Disruption",
    "Evacuation Required",
    "Infrastructure Damage",
    "Road Blocked",
    "Building Collapse Reported",
    "Fire Outbreak",
    "Flood Warning",
    "Power Outage",
    "Food Distribution Point",
  ];

  const category = categories[Math.floor(Math.random() * categories.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const title = titles[Math.floor(Math.random() * titles.length)];

  return {
    id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description: `${title} at ${location.address}. Verification in progress.`,
    location,
    status,
    severity,
    category,
    source: {
      type: Math.random() > 0.5 ? "telegram" : "whatsapp",
      authorityScore: Math.floor(Math.random() * 40) + 50,
    },
    verification: {
      score: status === "verified" ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 40,
      status,
      checks: [
        { type: "geolocation", passed: Math.random() > 0.3, confidence: Math.floor(Math.random() * 30) + 60 },
        { type: "peer_confirm", passed: Math.random() > 0.5, confidence: Math.floor(Math.random() * 40) + 40 },
      ],
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
    updatedAt: Date.now(),
    peerConfirmations: Math.floor(Math.random() * 5),
  };
}
