"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  MapPin,
  Globe,
  ChevronDown,
  AlertTriangle,
  Shield,
  CheckCheck,
  Clock,
} from "lucide-react";

// Time-zone based regions covering the entire world
const TIME_ZONE_REGIONS = [
  // UTC-12 to UTC-9: Pacific Islands, Alaska
  {
    id: "pacific-west",
    name: "Pacific West (UTC-12 to -9)",
    description: "Hawaii, Alaska, Pacific Islands",
    utcOffset: [-12, -9],
    lngRange: [-180, -135],
  },
  // UTC-8 to UTC-6: North America West
  {
    id: "americas-west",
    name: "Americas West (UTC-8 to -6)",
    description: "US/Canada West Coast, Mexico",
    utcOffset: [-8, -6],
    lngRange: [-135, -90],
  },
  // UTC-5 to UTC-3: North & South America East
  {
    id: "americas-east",
    name: "Americas East (UTC-5 to -3)",
    description: "US East, Caribbean, Brazil, Argentina",
    utcOffset: [-5, -3],
    lngRange: [-90, -30],
  },
  // UTC-2 to UTC+0: Atlantic, West Africa, UK
  {
    id: "atlantic-europe",
    name: "Atlantic & W. Europe (UTC-2 to 0)",
    description: "UK, Portugal, West Africa, Atlantic",
    utcOffset: [-2, 0],
    lngRange: [-30, 0],
  },
  // UTC+1 to UTC+2: Central & Eastern Europe, Central Africa
  {
    id: "europe-africa",
    name: "Europe & Africa (UTC+1 to +2)",
    description: "Central Europe, East Africa, Middle East",
    utcOffset: [1, 2],
    lngRange: [0, 30],
  },
  // UTC+3 to UTC+4: East Europe, Middle East, East Africa
  {
    id: "middle-east",
    name: "Middle East & E. Africa (UTC+3 to +4)",
    description: "Russia West, Turkey, Saudi Arabia, East Africa",
    utcOffset: [3, 4],
    lngRange: [30, 60],
  },
  // UTC+5 to UTC+6: Central Asia, South Asia West
  {
    id: "central-asia",
    name: "Central & South Asia (UTC+5 to +6)",
    description: "Pakistan, India, Bangladesh, Central Asia",
    utcOffset: [5, 6],
    lngRange: [60, 90],
  },
  // UTC+7 to UTC+8: Southeast Asia, China, Australia West
  {
    id: "east-asia",
    name: "East & SE Asia (UTC+7 to +8)",
    description: "China, Southeast Asia, Indonesia, Australia West",
    utcOffset: [7, 8],
    lngRange: [90, 120],
  },
  // UTC+9 to UTC+10: Japan, Korea, Australia East
  {
    id: "asia-pacific",
    name: "Asia Pacific (UTC+9 to +10)",
    description: "Japan, Korea, Philippines, Australia East",
    utcOffset: [9, 10],
    lngRange: [120, 150],
  },
  // UTC+11 to UTC+12: Pacific Islands, New Zealand
  {
    id: "pacific-east",
    name: "Pacific East (UTC+11 to +12)",
    description: "New Zealand, Pacific Islands, Fiji",
    utcOffset: [11, 12],
    lngRange: [150, 180],
  },
  // Global channel
  {
    id: "global",
    name: "Global",
    description: "Worldwide emergency channel",
    utcOffset: null,
    lngRange: null,
  },
];

interface ChatMessage {
  id: string;
  zoneId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  type: "message" | "alert" | "system";
  read: boolean;
}

// Generate initial messages for zones
const generateInitialMessages = (): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const now = Date.now();

  // Americas West
  messages.push(
    { id: "msg-1", zoneId: "americas-west", userId: "u1", userName: "Maria G.", message: "Wildfire evacuation route clear on Highway 101 north of LA", timestamp: now - 3600000, type: "alert", read: true },
    { id: "msg-2", zoneId: "americas-west", userId: "u2", userName: "James K.", message: "Power outage reported in San Francisco downtown area", timestamp: now - 7200000, type: "message", read: true },
  );

  // Americas East
  messages.push(
    { id: "msg-3", zoneId: "americas-east", userId: "u3", userName: "Carlos R.", message: "Hurricane shelter open at Miami Convention Center", timestamp: now - 5400000, type: "alert", read: true },
    { id: "msg-4", zoneId: "americas-east", userId: "u4", userName: "Ana P.", message: "Flooding on I-95, use alternate routes", timestamp: now - 9000000, type: "message", read: true },
  );

  // Europe & Africa
  messages.push(
    { id: "msg-5", zoneId: "europe-africa", userId: "u5", userName: "Klaus M.", message: "Heatwave warning: cooling centers open in Berlin city center", timestamp: now - 4500000, type: "alert", read: true },
    { id: "msg-6", zoneId: "europe-africa", userId: "u6", userName: "Fatima B.", message: "Flash flood warning lifted for Lagos coastal areas", timestamp: now - 8000000, type: "message", read: true },
  );

  // Middle East
  messages.push(
    { id: "msg-7", zoneId: "middle-east", userId: "u7", userName: "Ahmed K.", message: "Water distribution at Al-Shifa hospital parking, 2pm today", timestamp: now - 3600000, type: "alert", read: true },
    { id: "msg-8", zoneId: "middle-east", userId: "u8", userName: "Olena P.", message: "Shelter open at metro station Khreshchatyk, Kyiv", timestamp: now - 5400000, type: "alert", read: true },
    { id: "msg-9", zoneId: "middle-east", userId: "u9", userName: "Layla H.", message: "Medical supplies needed urgently at Damascus clinic", timestamp: now - 1800000, type: "alert", read: true },
  );

  // Central Asia
  messages.push(
    { id: "msg-10", zoneId: "central-asia", userId: "u10", userName: "Raj S.", message: "Cyclone shelter in Dhaka fully operational", timestamp: now - 6000000, type: "alert", read: true },
    { id: "msg-11", zoneId: "central-asia", userId: "u11", userName: "Priya M.", message: "Road to Karachi airport reopened after floods", timestamp: now - 10000000, type: "message", read: true },
  );

  // East Asia
  messages.push(
    { id: "msg-12", zoneId: "east-asia", userId: "u12", userName: "Wei L.", message: "Earthquake aftershock warning for Taiwan east coast", timestamp: now - 2400000, type: "alert", read: true },
    { id: "msg-13", zoneId: "east-asia", userId: "u13", userName: "Nguyen T.", message: "Typhoon passed, all clear in Ho Chi Minh City", timestamp: now - 7000000, type: "message", read: true },
  );

  // Asia Pacific
  messages.push(
    { id: "msg-14", zoneId: "asia-pacific", userId: "u14", userName: "Yuki T.", message: "Tsunami warning lifted for Tokyo Bay area", timestamp: now - 3200000, type: "alert", read: true },
    { id: "msg-15", zoneId: "asia-pacific", userId: "u15", userName: "Sarah W.", message: "Bushfire contained in NSW, evacuation order lifted", timestamp: now - 8500000, type: "message", read: true },
  );

  // Pacific regions
  messages.push(
    { id: "msg-16", zoneId: "pacific-east", userId: "u16", userName: "Tane M.", message: "Earthquake 6.1 felt in Wellington, no tsunami threat", timestamp: now - 4000000, type: "alert", read: true },
  );

  // Global messages
  messages.push(
    { id: "msg-17", zoneId: "global", userId: "system", userName: "SafeZone", message: "Welcome to SafeZone global chat. Your zone is auto-detected based on location. Switch zones using the dropdown above.", timestamp: now - 86400000, type: "system", read: true },
    { id: "msg-18", zoneId: "global", userId: "u17", userName: "UN Relief", message: "GDACS reports major earthquake in Philippines. All users in Asia-Pacific zone please check in.", timestamp: now - 3000000, type: "alert", read: true },
    { id: "msg-19", zoneId: "global", userId: "u18", userName: "Red Cross", message: "Global emergency funds activated for Middle East humanitarian response", timestamp: now - 6000000, type: "alert", read: true },
  );

  return messages;
};

interface ZoneChatProps {
  userLocation: { lat: number; lng: number } | null;
}

export function ZoneChat({ userLocation }: ZoneChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(generateInitialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("global");
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine user's zone based on longitude
  const userZone = useMemo(() => {
    if (!userLocation) return null;

    const { lng } = userLocation;

    for (const zone of TIME_ZONE_REGIONS) {
      if (zone.id === "global" || !zone.lngRange) continue;

      const [minLng, maxLng] = zone.lngRange;
      if (lng >= minLng && lng < maxLng) {
        return zone;
      }
    }

    return null;
  }, [userLocation]);

  // Auto-select user's zone when detected
  useEffect(() => {
    if (userZone && selectedZone === "global") {
      setSelectedZone(userZone.id);
    }
  }, [userZone, selectedZone]);

  // Filter messages by zone
  const zoneMessages = useMemo(() => {
    return messages
      .filter((m) => m.zoneId === selectedZone)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, selectedZone]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [zoneMessages]);

  // Simulate incoming messages
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.85) {
        const zones = TIME_ZONE_REGIONS.map(z => z.id);
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        const simulatedMessages = [
          "Any updates on the situation?",
          "Safe passage confirmed on main road",
          "Medical team en route to location",
          "Water supply restored in the area",
          "Shelter capacity reached, alternative available",
          "All clear signal received",
          "Need assistance with evacuation",
          "Power restored in affected district",
          "Roads reopened after inspection",
          "Emergency supplies arriving soon",
        ];

        const names = ["Alex K.", "Maria L.", "John D.", "Fatima A.", "Chen W.", "Emma S.", "Omar H.", "Lisa T."];

        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          zoneId: randomZone,
          userId: `user-${Math.random().toString(36).substr(2, 9)}`,
          userName: names[Math.floor(Math.random() * names.length)],
          message: simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)],
          timestamp: Date.now(),
          type: Math.random() > 0.7 ? "alert" : "message",
          read: isOpen && selectedZone === randomZone,
        };

        setMessages((prev) => [...prev, newMsg]);

        if (!isOpen || selectedZone !== randomZone) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen, selectedZone]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      zoneId: selectedZone,
      userId: "current-user",
      userName: "You",
      message: newMessage.trim(),
      timestamp: Date.now(),
      type: "message",
      read: true,
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");

    if ("vibrate" in navigator) {
      navigator.vibrate(30);
    }
  }, [newMessage, selectedZone]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const currentZone = TIME_ZONE_REGIONS.find((z) => z.id === selectedZone);
  // Generate a stable online count per zone
  const onlineCount = useMemo(() => {
    // Use zone id to generate a pseudo-random but stable count
    const hash = selectedZone.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 50 + (hash % 200);
  }, [selectedZone]);

  return (
    <>
      {/* Chat Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setUnreadCount(0);
        }}
        className={cn(
          "fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-[9998]",
          "h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white",
          "shadow-lg flex items-center justify-center transition-all hover:scale-105"
        )}
        aria-label="Open zone chat"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] lg:inset-auto lg:bottom-6 lg:left-6 lg:w-[420px] lg:h-[650px] lg:rounded-2xl lg:shadow-2xl overflow-hidden bg-white flex flex-col">
          {/* Header */}
          <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <div>
                <h2 className="font-semibold">Zone Chat</h2>
                <p className="text-xs text-blue-200">
                  {onlineCount} users online in zone
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Zone Selector */}
          <div className="border-b border-gray-200 px-3 py-2 flex-shrink-0 bg-gray-50">
            <button
              type="button"
              onClick={() => setShowZoneSelector(!showZoneSelector)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                {selectedZone === "global" ? (
                  <Globe className="h-4 w-4 text-blue-600" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500" />
                )}
                <div className="text-left">
                  <span className="font-medium text-gray-900 block">
                    {currentZone?.name || "Select Zone"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {currentZone?.description}
                  </span>
                </div>
                {userZone && selectedZone === userZone.id && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">
                    Your zone
                  </span>
                )}
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", showZoneSelector && "rotate-180")} />
            </button>

            {/* Zone Dropdown */}
            {showZoneSelector && (
              <nav className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg" style={{ WebkitOverflowScrolling: "touch" }}>
                <ul className="divide-y divide-gray-100">
                  {TIME_ZONE_REGIONS.map((zone) => {
                    const zoneMessageCount = messages.filter((m) => m.zoneId === zone.id).length;
                    const isUserZone = userZone?.id === zone.id;
                    const hasUnread = messages.some(m => m.zoneId === zone.id && !m.read);

                    return (
                      <li key={zone.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedZone(zone.id);
                            setShowZoneSelector(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-3 hover:bg-gray-50 transition-colors text-left",
                            selectedZone === zone.id && "bg-blue-50"
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {zone.id === "global" ? (
                              <Globe className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            ) : (
                              <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-sm truncate",
                                  selectedZone === zone.id ? "font-semibold text-blue-600" : "font-medium text-gray-900"
                                )}>
                                  {zone.name}
                                </span>
                                {isUserZone && (
                                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex-shrink-0">
                                    You
                                  </span>
                                )}
                                {hasUnread && (
                                  <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                                )}
                              </div>
                              <span className="text-xs text-gray-500 truncate block">
                                {zone.description}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {zoneMessageCount}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>

          {/* Messages */}
          <main
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {zoneMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-sm text-gray-400">
                  Be the first to share information in this zone
                </p>
              </div>
            ) : (
              zoneMessages.map((msg) => {
                const isOwnMessage = msg.userId === "current-user";
                const isSystem = msg.type === "system";
                const isAlert = msg.type === "alert";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs max-w-[90%]">
                        <Shield className="h-3 w-3 inline mr-1" />
                        {msg.message}
                      </div>
                    </div>
                  );
                }

                return (
                  <article
                    key={msg.id}
                    className={cn(
                      "flex",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm",
                        isOwnMessage
                          ? "bg-blue-600 text-white rounded-br-md"
                          : isAlert
                            ? "bg-amber-50 border border-amber-200 rounded-bl-md"
                            : "bg-white border border-gray-100 rounded-bl-md"
                      )}
                    >
                      {!isOwnMessage && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs font-semibold",
                            isAlert ? "text-amber-700" : "text-gray-700"
                          )}>
                            {msg.userName}
                          </span>
                          {isAlert && (
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                      )}
                      <p className={cn(
                        "text-sm leading-relaxed",
                        isOwnMessage ? "text-white" : isAlert ? "text-amber-900" : "text-gray-800"
                      )}>
                        {msg.message}
                      </p>
                      <div className={cn(
                        "flex items-center justify-end gap-1 mt-1",
                        isOwnMessage ? "text-blue-200" : "text-gray-400"
                      )}>
                        <time className="text-xs">{formatTime(msg.timestamp)}</time>
                        {isOwnMessage && (
                          <CheckCheck className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </main>

          {/* Input */}
          <footer className="border-t border-gray-200 p-3 flex-shrink-0 bg-white safe-area-inset-bottom">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="chat-input" className="sr-only">Message</label>
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${currentZone?.name || "zone"}...`}
                className="flex-1 h-12 px-4 rounded-xl bg-gray-100 border-none text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                  newMessage.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
}
