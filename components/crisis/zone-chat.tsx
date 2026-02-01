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
  Flag,
  Search,
} from "lucide-react";

// Country-based chat zones
const COUNTRY_ZONES = [
  // Global
  { id: "global", name: "Global", flag: "🌍", region: "Worldwide", description: "Worldwide emergency channel" },
  
  // North America
  { id: "us", name: "United States", flag: "🇺🇸", region: "North America", description: "USA emergency coordination" },
  { id: "ca", name: "Canada", flag: "🇨🇦", region: "North America", description: "Canada emergency coordination" },
  { id: "mx", name: "Mexico", flag: "🇲🇽", region: "North America", description: "Mexico emergency coordination" },
  
  // South America
  { id: "br", name: "Brazil", flag: "🇧🇷", region: "South America", description: "Brazil emergency coordination" },
  { id: "ar", name: "Argentina", flag: "🇦🇷", region: "South America", description: "Argentina emergency coordination" },
  { id: "co", name: "Colombia", flag: "🇨🇴", region: "South America", description: "Colombia emergency coordination" },
  
  // Europe
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", region: "Europe", description: "UK emergency coordination" },
  { id: "de", name: "Germany", flag: "🇩🇪", region: "Europe", description: "Germany emergency coordination" },
  { id: "fr", name: "France", flag: "🇫🇷", region: "Europe", description: "France emergency coordination" },
  { id: "it", name: "Italy", flag: "🇮🇹", region: "Europe", description: "Italy emergency coordination" },
  { id: "es", name: "Spain", flag: "🇪🇸", region: "Europe", description: "Spain emergency coordination" },
  { id: "pl", name: "Poland", flag: "🇵🇱", region: "Europe", description: "Poland emergency coordination" },
  { id: "ua", name: "Ukraine", flag: "🇺🇦", region: "Europe", description: "Ukraine emergency coordination" },
  { id: "nl", name: "Netherlands", flag: "🇳🇱", region: "Europe", description: "Netherlands emergency coordination" },
  
  // Middle East
  { id: "tr", name: "Turkey", flag: "🇹🇷", region: "Middle East", description: "Turkey emergency coordination" },
  { id: "sa", name: "Saudi Arabia", flag: "🇸🇦", region: "Middle East", description: "Saudi Arabia emergency coordination" },
  { id: "ae", name: "UAE", flag: "🇦🇪", region: "Middle East", description: "UAE emergency coordination" },
  { id: "il", name: "Israel", flag: "🇮🇱", region: "Middle East", description: "Israel emergency coordination" },
  { id: "ps", name: "Palestine", flag: "🇵🇸", region: "Middle East", description: "Palestine emergency coordination" },
  { id: "sy", name: "Syria", flag: "🇸🇾", region: "Middle East", description: "Syria emergency coordination" },
  { id: "iq", name: "Iraq", flag: "🇮🇶", region: "Middle East", description: "Iraq emergency coordination" },
  { id: "ir", name: "Iran", flag: "🇮🇷", region: "Middle East", description: "Iran emergency coordination" },
  
  // Africa
  { id: "eg", name: "Egypt", flag: "🇪🇬", region: "Africa", description: "Egypt emergency coordination" },
  { id: "za", name: "South Africa", flag: "🇿🇦", region: "Africa", description: "South Africa emergency coordination" },
  { id: "ng", name: "Nigeria", flag: "🇳🇬", region: "Africa", description: "Nigeria emergency coordination" },
  { id: "ke", name: "Kenya", flag: "🇰🇪", region: "Africa", description: "Kenya emergency coordination" },
  { id: "sd", name: "Sudan", flag: "🇸🇩", region: "Africa", description: "Sudan emergency coordination" },
  { id: "et", name: "Ethiopia", flag: "🇪🇹", region: "Africa", description: "Ethiopia emergency coordination" },
  
  // Asia
  { id: "in", name: "India", flag: "🇮🇳", region: "Asia", description: "India emergency coordination" },
  { id: "pk", name: "Pakistan", flag: "🇵🇰", region: "Asia", description: "Pakistan emergency coordination" },
  { id: "bd", name: "Bangladesh", flag: "🇧🇩", region: "Asia", description: "Bangladesh emergency coordination" },
  { id: "cn", name: "China", flag: "🇨🇳", region: "Asia", description: "China emergency coordination" },
  { id: "jp", name: "Japan", flag: "🇯🇵", region: "Asia", description: "Japan emergency coordination" },
  { id: "kr", name: "South Korea", flag: "🇰🇷", region: "Asia", description: "South Korea emergency coordination" },
  { id: "ph", name: "Philippines", flag: "🇵🇭", region: "Asia", description: "Philippines emergency coordination" },
  { id: "id", name: "Indonesia", flag: "🇮🇩", region: "Asia", description: "Indonesia emergency coordination" },
  { id: "th", name: "Thailand", flag: "🇹🇭", region: "Asia", description: "Thailand emergency coordination" },
  { id: "vn", name: "Vietnam", flag: "🇻🇳", region: "Asia", description: "Vietnam emergency coordination" },
  { id: "mm", name: "Myanmar", flag: "🇲🇲", region: "Asia", description: "Myanmar emergency coordination" },
  
  // Oceania
  { id: "au", name: "Australia", flag: "🇦🇺", region: "Oceania", description: "Australia emergency coordination" },
  { id: "nz", name: "New Zealand", flag: "🇳🇿", region: "Oceania", description: "New Zealand emergency coordination" },
];

// Group countries by region for the selector
const REGIONS = ["Worldwide", "North America", "South America", "Europe", "Middle East", "Africa", "Asia", "Oceania"];

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

  // USA
  messages.push(
    { id: "msg-1", zoneId: "us", userId: "u1", userName: "Maria G.", message: "Wildfire evacuation route clear on Highway 101 north of LA", timestamp: now - 3600000, type: "alert", read: true },
    { id: "msg-2", zoneId: "us", userId: "u2", userName: "James K.", message: "Power outage reported in San Francisco downtown area", timestamp: now - 7200000, type: "message", read: true },
  );

  // UK
  messages.push(
    { id: "msg-3", zoneId: "uk", userId: "u3", userName: "Sarah W.", message: "Flooding warning for Somerset area, avoid A39", timestamp: now - 5400000, type: "alert", read: true },
  );

  // Germany
  messages.push(
    { id: "msg-4", zoneId: "de", userId: "u4", userName: "Klaus M.", message: "Heatwave warning: cooling centers open in Berlin city center", timestamp: now - 4500000, type: "alert", read: true },
  );

  // Ukraine
  messages.push(
    { id: "msg-5", zoneId: "ua", userId: "u5", userName: "Olena P.", message: "Shelter open at metro station Khreshchatyk, Kyiv", timestamp: now - 5400000, type: "alert", read: true },
    { id: "msg-6", zoneId: "ua", userId: "u6", userName: "Dmytro K.", message: "Power restored in Odesa district 7", timestamp: now - 3200000, type: "message", read: true },
  );

  // Palestine
  messages.push(
    { id: "msg-7", zoneId: "ps", userId: "u7", userName: "Ahmed K.", message: "Water distribution at Al-Shifa hospital parking, 2pm today", timestamp: now - 3600000, type: "alert", read: true },
    { id: "msg-8", zoneId: "ps", userId: "u8", userName: "Fatima H.", message: "Medical supplies needed urgently at Gaza clinic", timestamp: now - 1800000, type: "alert", read: true },
  );

  // Syria
  messages.push(
    { id: "msg-9", zoneId: "sy", userId: "u9", userName: "Layla H.", message: "Food distribution at Damascus community center tomorrow 9am", timestamp: now - 4200000, type: "alert", read: true },
  );

  // Turkey
  messages.push(
    { id: "msg-10", zoneId: "tr", userId: "u10", userName: "Mehmet A.", message: "Earthquake aftershock felt in Antakya, stay alert", timestamp: now - 2800000, type: "alert", read: true },
  );

  // India
  messages.push(
    { id: "msg-11", zoneId: "in", userId: "u11", userName: "Raj S.", message: "Cyclone shelter in Chennai fully operational", timestamp: now - 6000000, type: "alert", read: true },
    { id: "msg-12", zoneId: "in", userId: "u12", userName: "Priya M.", message: "Flood waters receding in Kerala, roads reopening", timestamp: now - 4000000, type: "message", read: true },
  );

  // Japan
  messages.push(
    { id: "msg-13", zoneId: "jp", userId: "u13", userName: "Yuki T.", message: "Tsunami warning lifted for Tokyo Bay area", timestamp: now - 3200000, type: "alert", read: true },
  );

  // Philippines
  messages.push(
    { id: "msg-14", zoneId: "ph", userId: "u14", userName: "Juan D.", message: "Typhoon passed, all clear in Manila metro", timestamp: now - 7000000, type: "message", read: true },
  );

  // Australia
  messages.push(
    { id: "msg-15", zoneId: "au", userId: "u15", userName: "Emma W.", message: "Bushfire contained in NSW, evacuation order lifted", timestamp: now - 8500000, type: "alert", read: true },
  );

  // Sudan
  messages.push(
    { id: "msg-16", zoneId: "sd", userId: "u16", userName: "Omar M.", message: "Humanitarian corridor open on Route 1 until 6pm", timestamp: now - 2400000, type: "alert", read: true },
  );

  // Global messages
  messages.push(
    { id: "msg-17", zoneId: "global", userId: "system", userName: "SafeZone", message: "Welcome to SafeZone global chat. Select your country from the dropdown to join local emergency coordination.", timestamp: now - 86400000, type: "system", read: true },
    { id: "msg-18", zoneId: "global", userId: "u17", userName: "UN Relief", message: "GDACS reports major earthquake in Philippines. All users please check in with status.", timestamp: now - 3000000, type: "alert", read: true },
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
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Filter countries by search
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRY_ZONES;
    const query = searchQuery.toLowerCase();
    return COUNTRY_ZONES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.region.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group filtered countries by region
  const groupedCountries = useMemo(() => {
    const groups: Record<string, typeof COUNTRY_ZONES> = {};
    for (const region of REGIONS) {
      const countries = filteredCountries.filter((c) => 
        c.region === region || (region === "Worldwide" && c.id === "global")
      );
      if (countries.length > 0) {
        groups[region] = countries;
      }
    }
    return groups;
  }, [filteredCountries]);

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (panelRef.current && isOpen) {
        // Ensure panel stays within viewport
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        
        if (vw < 1024) {
          // Mobile: full screen
          panelRef.current.style.height = `${vh}px`;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => setTimeout(handleResize, 100));
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [isOpen]);

  // Simulate incoming messages
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.85) {
        const zones = COUNTRY_ZONES.map(z => z.id);
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

  const currentZone = COUNTRY_ZONES.find((z) => z.id === selectedZone);
  // Generate a stable online count per zone
  const onlineCount = useMemo(() => {
    const hash = selectedZone.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 50 + (hash % 500);
  }, [selectedZone]);

  return (
    <>
      {/* Chat Button - Always visible above map */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          className={cn(
            "fixed bottom-24 left-4 lg:bottom-6 lg:left-6 z-[9990]",
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
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          ref={panelRef}
          className="fixed inset-0 z-[9995] lg:inset-auto lg:bottom-6 lg:left-6 lg:w-[420px] lg:h-[600px] lg:max-h-[calc(100vh-48px)] lg:rounded-2xl lg:shadow-2xl overflow-hidden bg-white flex flex-col"
        >
          {/* Header */}
          <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {currentZone?.id === "global" ? (
                <Globe className="h-5 w-5" />
              ) : (
                <span className="text-xl">{currentZone?.flag}</span>
              )}
              <div>
                <h2 className="font-semibold">{currentZone?.name || "Zone Chat"}</h2>
                <p className="text-xs text-blue-200">
                  {onlineCount} users online
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
                {currentZone?.id === "global" ? (
                  <Globe className="h-5 w-5 text-blue-600" />
                ) : (
                  <span className="text-lg">{currentZone?.flag}</span>
                )}
                <div className="text-left">
                  <span className="font-medium text-gray-900 block">
                    {currentZone?.name || "Select Country"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {currentZone?.region}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", showZoneSelector && "rotate-180")} />
            </button>

            {/* Zone Dropdown */}
            {showZoneSelector && (
              <div className="mt-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search country..."
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Country List */}
                <nav className="max-h-64 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                  {Object.entries(groupedCountries).map(([region, countries]) => (
                    <div key={region}>
                      <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0">
                        {region}
                      </div>
                      <ul>
                        {countries.map((zone) => {
                          const zoneMessageCount = messages.filter((m) => m.zoneId === zone.id).length;
                          const hasUnread = messages.some(m => m.zoneId === zone.id && !m.read);

                          return (
                            <li key={zone.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedZone(zone.id);
                                  setShowZoneSelector(false);
                                  setSearchQuery("");
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left",
                                  selectedZone === zone.id && "bg-blue-50"
                                )}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="text-lg flex-shrink-0">{zone.flag}</span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={cn(
                                        "text-sm truncate",
                                        selectedZone === zone.id ? "font-semibold text-blue-600" : "font-medium text-gray-900"
                                      )}>
                                        {zone.name}
                                      </span>
                                      {hasUnread && (
                                        <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                                      )}
                                    </div>
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
                    </div>
                  ))}
                </nav>
              </div>
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
                  Be the first to share information in {currentZone?.name}
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
