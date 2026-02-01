"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  MapPin,
  Users,
  Globe,
  ChevronDown,
  AlertTriangle,
  Clock,
  Shield,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Define global city zones with coordinates
const CITY_ZONES = [
  { id: "gaza", name: "Gaza Strip", lat: 31.5, lng: 34.47, radius: 50 },
  { id: "kyiv", name: "Kyiv, Ukraine", lat: 50.45, lng: 30.52, radius: 100 },
  { id: "kharkiv", name: "Kharkiv, Ukraine", lat: 49.99, lng: 36.23, radius: 80 },
  { id: "damascus", name: "Damascus, Syria", lat: 33.51, lng: 36.29, radius: 60 },
  { id: "aleppo", name: "Aleppo, Syria", lat: 36.2, lng: 37.15, radius: 50 },
  { id: "sanaa", name: "Sana'a, Yemen", lat: 15.37, lng: 44.19, radius: 40 },
  { id: "portauprince", name: "Port-au-Prince, Haiti", lat: 18.59, lng: -72.31, radius: 30 },
  { id: "mogadishu", name: "Mogadishu, Somalia", lat: 2.04, lng: 45.34, radius: 40 },
  { id: "kabul", name: "Kabul, Afghanistan", lat: 34.53, lng: 69.17, radius: 50 },
  { id: "tripoli", name: "Tripoli, Libya", lat: 32.89, lng: 13.19, radius: 40 },
  { id: "dhaka", name: "Dhaka, Bangladesh", lat: 23.81, lng: 90.41, radius: 60 },
  { id: "manila", name: "Manila, Philippines", lat: 14.6, lng: 120.98, radius: 50 },
  { id: "losangeles", name: "Los Angeles, USA", lat: 34.05, lng: -118.24, radius: 100 },
  { id: "tokyo", name: "Tokyo, Japan", lat: 35.68, lng: 139.69, radius: 80 },
  { id: "istanbul", name: "Istanbul, Turkey", lat: 41.01, lng: 28.98, radius: 70 },
  { id: "global", name: "Global", lat: 0, lng: 0, radius: 99999 },
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

// Mock initial messages for each zone
const generateInitialMessages = (): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const now = Date.now();

  // Gaza messages
  messages.push(
    { id: "msg-1", zoneId: "gaza", userId: "u1", userName: "Ahmed K.", message: "Water distribution at Al-Shifa hospital parking, 2pm today", timestamp: now - 3600000, type: "alert", read: true },
    { id: "msg-2", zoneId: "gaza", userId: "u2", userName: "Sara M.", message: "Road to Rafah crossing blocked, use alternate route via Salah al-Din", timestamp: now - 7200000, type: "message", read: true },
    { id: "msg-3", zoneId: "gaza", userId: "u3", userName: "Yusuf A.", message: "Medical supplies needed urgently at Khan Younis clinic", timestamp: now - 1800000, type: "alert", read: true },
  );

  // Kyiv messages
  messages.push(
    { id: "msg-4", zoneId: "kyiv", userId: "u4", userName: "Olena P.", message: "Shelter open at metro station Khreshchatyk", timestamp: now - 5400000, type: "alert", read: true },
    { id: "msg-5", zoneId: "kyiv", userId: "u5", userName: "Dmytro S.", message: "Power restored in Obolon district", timestamp: now - 9000000, type: "message", read: true },
  );

  // Damascus messages
  messages.push(
    { id: "msg-6", zoneId: "damascus", userId: "u6", userName: "Layla H.", message: "Food distribution at Yarmouk camp tomorrow 8am", timestamp: now - 4500000, type: "alert", read: true },
  );

  // Global messages
  messages.push(
    { id: "msg-7", zoneId: "global", userId: "system", userName: "SafeZone", message: "Welcome to SafeZone global chat. Select your zone to connect with nearby users.", timestamp: now - 86400000, type: "system", read: true },
    { id: "msg-8", zoneId: "global", userId: "u7", userName: "Relief Coordinator", message: "GDACS reports 7.2 magnitude earthquake in Philippines. All users in affected area please check in.", timestamp: now - 3000000, type: "alert", read: true },
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

  // Determine user's zone based on location
  const userZone = useMemo(() => {
    if (!userLocation) return null;

    const { lat, lng } = userLocation;

    // Find the closest zone within radius
    for (const zone of CITY_ZONES) {
      if (zone.id === "global") continue;

      const distance = Math.sqrt(
        Math.pow(lat - zone.lat, 2) + Math.pow(lng - zone.lng, 2)
      ) * 111; // Rough km conversion

      if (distance <= zone.radius) {
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
        const zones = ["gaza", "kyiv", "damascus", "global"];
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        const simulatedMessages = [
          "Any updates on the situation?",
          "Safe passage confirmed on main road",
          "Medical team en route to location",
          "Water supply restored in sector 3",
          "Shelter capacity reached, alternative at central square",
          "All clear signal received",
          "Need assistance with evacuation",
        ];

        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          zoneId: randomZone,
          userId: `user-${Math.random().toString(36).substr(2, 9)}`,
          userName: `User ${Math.floor(Math.random() * 100)}`,
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
    }, 8000);

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

    // Haptic feedback
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

  const currentZone = CITY_ZONES.find((z) => z.id === selectedZone);
  const onlineCount = Math.floor(Math.random() * 50) + 10;

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
        <div className="fixed inset-0 z-[9999] lg:inset-auto lg:bottom-6 lg:left-6 lg:w-96 lg:h-[600px] lg:rounded-2xl lg:shadow-2xl overflow-hidden bg-white flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Zone Chat</h3>
                <p className="text-xs text-blue-200">
                  {onlineCount} users online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Zone Selector */}
          <div className="border-b border-gray-200 px-3 py-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowZoneSelector(!showZoneSelector)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                {selectedZone === "global" ? (
                  <Globe className="h-4 w-4 text-blue-600" />
                ) : (
                  <MapPin className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium text-gray-900">
                  {currentZone?.name || "Select Zone"}
                </span>
                {userZone && selectedZone === userZone.id && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Your area
                  </span>
                )}
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", showZoneSelector && "rotate-180")} />
            </button>

            {/* Zone Dropdown */}
            {showZoneSelector && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                {CITY_ZONES.map((zone) => {
                  const zoneMessageCount = messages.filter((m) => m.zoneId === zone.id).length;
                  const isUserZone = userZone?.id === zone.id;

                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        setSelectedZone(zone.id);
                        setShowZoneSelector(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors text-left",
                        selectedZone === zone.id && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {zone.id === "global" ? (
                          <Globe className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MapPin className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={cn("text-sm", selectedZone === zone.id && "font-medium text-blue-600")}>
                          {zone.name}
                        </span>
                        {isUserZone && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {zoneMessageCount} msgs
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
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
                      <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-xs">
                        <Shield className="h-3 w-3 inline mr-1" />
                        {msg.message}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2",
                        isOwnMessage
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : isAlert
                            ? "bg-amber-50 border border-amber-200 rounded-bl-sm"
                            : "bg-gray-100 rounded-bl-sm"
                      )}
                    >
                      {!isOwnMessage && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs font-semibold",
                            isAlert ? "text-amber-700" : "text-gray-600"
                          )}>
                            {msg.userName}
                          </span>
                          {isAlert && (
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                      )}
                      <p className={cn(
                        "text-sm",
                        isOwnMessage ? "text-white" : isAlert ? "text-amber-900" : "text-gray-800"
                      )}>
                        {msg.message}
                      </p>
                      <div className={cn(
                        "flex items-center justify-end gap-1 mt-1",
                        isOwnMessage ? "text-blue-200" : "text-gray-400"
                      )}>
                        <span className="text-xs">{formatTime(msg.timestamp)}</span>
                        {isOwnMessage && (
                          <CheckCheck className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex-shrink-0 bg-white safe-area-inset-bottom">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${currentZone?.name || "zone"}...`}
                className="flex-1 h-11 px-4 rounded-xl bg-gray-100 border-none text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center transition-colors",
                  newMessage.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
