import { NextResponse } from "next/server";

// GDACS RSS Feed URLs - Updated every 6 minutes by GDACS
const GDACS_FEEDS = {
  all24h: "https://www.gdacs.org/xml/rss_24h.xml",
  allWeek: "https://www.gdacs.org/xml/rss.xml",
  earthquakes: "https://www.gdacs.org/xml/rss_eq_24h.xml",
  cyclones: "https://www.gdacs.org/xml/rss_tc_7d.xml",
  floods: "https://www.gdacs.org/xml/rss_fl_7d.xml",
};

interface GDACSEvent {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category: string;
  alertLevel: "Green" | "Orange" | "Red";
  severity: "low" | "medium" | "high" | "critical";
  location: {
    lat: number;
    lng: number;
    country?: string;
  };
  eventType: string;
  population?: number;
}

// Simple XML parsing without external dependencies
function parseXMLText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";
  // Remove CDATA wrapper if present
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function parseGDACSFeed(xml: string): GDACSEvent[] {
  const events: GDACSEvent[] = [];

  // Split by item tags
  const items = xml.split(/<item>/i).slice(1);

  for (const item of items) {
    try {
      const title = parseXMLText(item, "title");
      const description = parseXMLText(item, "description");
      const link = parseXMLText(item, "link");
      const pubDate = parseXMLText(item, "pubDate");
      const category = parseXMLText(item, "category");

      // Parse GDACS-specific fields
      const alertLevel = parseXMLText(item, "gdacs:alertlevel") || "Green";
      const eventType = parseXMLText(item, "gdacs:eventtype") || category;
      const country = parseXMLText(item, "gdacs:country");
      const population = parseXMLText(item, "gdacs:population");

      // Parse geo coordinates
      const geoPoint = item.match(/<georss:point>([^<]+)<\/georss:point>/i);
      let lat = 0;
      let lng = 0;

      if (geoPoint) {
        const coords = geoPoint[1].trim().split(/\s+/);
        lat = parseFloat(coords[0]) || 0;
        lng = parseFloat(coords[1]) || 0;
      }

      // Map alert level to severity
      let severity: GDACSEvent["severity"] = "low";
      if (alertLevel === "Red") severity = "critical";
      else if (alertLevel === "Orange") severity = "high";
      else if (alertLevel === "Green") severity = "medium";

      // Generate unique ID
      const id = `gdacs-${Buffer.from(link || title).toString("base64").slice(0, 12)}`;

      events.push({
        id,
        title: title || "Unknown Event",
        description: description || "",
        link,
        pubDate,
        category: category || eventType,
        alertLevel: alertLevel as GDACSEvent["alertLevel"],
        severity,
        location: {
          lat,
          lng,
          country: country || undefined,
        },
        eventType: eventType || "Unknown",
        population: population ? parseInt(population, 10) : undefined,
      });
    } catch {
      // Skip malformed items
      continue;
    }
  }

  return events;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedType = searchParams.get("feed") || "all24h";

  try {
    const feedUrl = GDACS_FEEDS[feedType as keyof typeof GDACS_FEEDS] || GDACS_FEEDS.all24h;

    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "SafeZone-CrisisOS/1.0 (https://safezone.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      next: {
        revalidate: 360, // Cache for 6 minutes (GDACS update interval)
      },
    });

    if (!response.ok) {
      throw new Error(`GDACS API returned ${response.status}`);
    }

    const xml = await response.text();
    const events = parseGDACSFeed(xml);

    // Transform to our incident format
    const incidents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      status: event.alertLevel === "Red" ? "verified" : "unconfirmed",
      severity: event.severity,
      category: mapEventTypeToCategory(event.eventType),
      source: {
        type: "direct" as const,
        authorityScore: event.alertLevel === "Red" ? 95 : event.alertLevel === "Orange" ? 80 : 60,
      },
      verification: {
        score: event.alertLevel === "Red" ? 95 : event.alertLevel === "Orange" ? 75 : 50,
        status: event.alertLevel === "Red" ? "verified" : "unconfirmed",
        checks: [],
        timestamp: new Date(event.pubDate).getTime() || Date.now(),
      },
      timestamp: new Date(event.pubDate).getTime() || Date.now(),
      updatedAt: Date.now(),
      peerConfirmations: event.alertLevel === "Red" ? 10 : event.alertLevel === "Orange" ? 5 : 1,
      externalLink: event.link,
      alertLevel: event.alertLevel,
      affectedPopulation: event.population,
    }));

    return NextResponse.json({
      success: true,
      count: incidents.length,
      source: "GDACS",
      lastUpdated: new Date().toISOString(),
      incidents,
    });
  } catch (error) {
    console.error("GDACS API Error:", error);

    // Return empty array with error info - don't fail completely
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch live disaster data",
        message: error instanceof Error ? error.message : "Unknown error",
        incidents: [],
      },
      { status: 200 } // Return 200 so client doesn't break
    );
  }
}

function mapEventTypeToCategory(eventType: string): string {
  const type = eventType.toLowerCase();
  if (type.includes("earthquake") || type.includes("eq")) return "infrastructure";
  if (type.includes("flood") || type.includes("fl")) return "water";
  if (type.includes("cyclone") || type.includes("tc") || type.includes("hurricane") || type.includes("typhoon"))
    return "evacuation";
  if (type.includes("volcano") || type.includes("vo")) return "evacuation";
  if (type.includes("drought") || type.includes("dr")) return "water";
  if (type.includes("wildfire") || type.includes("wf")) return "evacuation";
  return "other";
}
