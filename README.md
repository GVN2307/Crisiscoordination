# SafeZone - Crisis Coordination Platform

A real-time disaster monitoring and emergency coordination platform that helps civilians report emergencies, view live global disaster alerts, and communicate with others in their region during crisis situations.

## Table of Contents

- [What is SafeZone?](#what-is-safezone)
- [Features](#features)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [Deployment](#deployment)

---

## What is SafeZone?

SafeZone is a civilian crisis coordination app designed to help people during emergencies like natural disasters, conflicts, or humanitarian crises. Unlike enterprise solutions that cost thousands of dollars, SafeZone is free and accessible to everyone.

**Key Problems It Solves:**

1. **Information Chaos** - During disasters, social media and messaging apps become flooded with unverified information. SafeZone aggregates and helps verify reports.

2. **No Centralized View** - Emergency responders and civilians need a single dashboard to see all incidents in their area. SafeZone provides this with an interactive map.

3. **Communication Gaps** - People in crisis zones often can't reach official channels. Zone-based chat lets them communicate with others nearby.

4. **Delayed Alerts** - SafeZone pulls real-time data from GDACS (Global Disaster Alert and Coordination System) to show earthquakes, floods, and cyclones as they happen.

---

## Features

### 1. Interactive Map with Live Location
- Shows your current location on the map
- Displays all reported incidents with color-coded severity markers
- Red = Critical, Orange = High, Blue = Medium, Green = Resolved
- Click any marker to see incident details

### 2. Real-Time Disaster Feed
- Pulls live data from GDACS (UN-backed disaster alert system)
- Shows earthquakes, floods, cyclones, and other disasters worldwide
- Auto-refreshes every 60 seconds

### 3. Emergency SOS Button
- Large floating red button always visible on screen
- One-tap to report emergencies
- Automatically captures your GPS location
- Choose from 6 emergency types: Medical, Security, Shelter, Water/Food, Evacuation, Other

### 4. Zone-Based Chat
- World divided into 10 time-zone regions
- Communicate with others in your region
- See alerts and updates from local users
- Global channel for worldwide emergency broadcasts

### 5. Incident Verification
- View detailed information about any incident
- See verification status (AI-checked, peer-confirmed)
- Confirm or flag reports as false
- Source chain shows verification history

---

## Getting Started

### Prerequisites

Before you begin, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/safezone.git
   cd safezone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   
   Go to [http://localhost:3000](http://localhost:3000)

That's it! The app should now be running on your computer.

### Environment Variables (Optional)

The app works without any API keys. However, for production deployment, you may want to set:

```env
# No required environment variables
# GDACS API is free and requires no authentication
```

---

## How to Use

### For Civilians (Reporting Emergencies)

1. **Allow Location Access** - When prompted, allow the app to access your location. This helps show incidents near you.

2. **Report an Emergency**
   - Click the large red "SOS" button in the bottom-right corner
   - Select the type of emergency
   - Your location is automatically attached
   - Submit the report

3. **View Incidents**
   - Switch between Map View and List View using the toggle
   - Click any incident to see details
   - Use "Get Directions" to navigate to a location

4. **Chat with Others**
   - Click the blue chat icon in the bottom-left
   - Your time zone is auto-detected
   - Send messages to share information with others nearby

### For Responders (Monitoring)

1. **Dashboard Overview**
   - Header shows total incidents and live connection status
   - Map displays all incidents color-coded by severity
   - List view shows incidents sorted by severity

2. **Verify Incidents**
   - Click any incident to open the verification panel
   - Review AI verification checks
   - Confirm or flag the report

---

## Project Structure

```
safezone/
├── app/                        # Next.js app directory
│   ├── api/                    # API routes
│   │   └── disasters/          # GDACS data fetching
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main dashboard page
│
├── components/
│   ├── crisis/                 # Crisis-specific components
│   │   ├── floating-sos.tsx    # Emergency SOS button
│   │   ├── incident-feed.tsx   # Incident list
│   │   ├── leaflet-map.tsx     # Interactive map
│   │   ├── verification-panel.tsx  # Incident details
│   │   └── zone-chat.tsx       # Regional chat
│   └── ui/                     # Reusable UI components
│
├── lib/
│   ├── mock-data.ts            # Sample incident data
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions
│
└── public/                     # Static assets
    └── manifest.json           # PWA manifest
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main dashboard - combines all components |
| `app/api/disasters/route.ts` | Fetches live data from GDACS |
| `components/crisis/leaflet-map.tsx` | Interactive map with OpenStreetMap |
| `components/crisis/floating-sos.tsx` | Emergency report button |
| `components/crisis/zone-chat.tsx` | Regional chat system |
| `lib/types.ts` | TypeScript interfaces for incidents, users, etc. |

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with server components |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS styling |
| **Leaflet.js** | Open-source interactive maps |
| **OpenStreetMap** | Free map tiles |
| **SWR** | Data fetching and caching |
| **GDACS API** | Live disaster alerts (free, no key needed) |
| **shadcn/ui** | Pre-built accessible components |

---

## API Reference

### GET /api/disasters

Fetches real-time disaster data from GDACS.

**Response:**
```json
{
  "disasters": [
    {
      "id": "gdacs-EQ-123",
      "title": "Earthquake M 6.2 in Japan",
      "severity": "high",
      "category": "other",
      "location": {
        "lat": 35.6762,
        "lng": 139.6503,
        "address": "Japan"
      },
      "timestamp": 1706745600000,
      "source": "GDACS",
      "status": "verified"
    }
  ],
  "lastUpdated": "2026-02-01T12:00:00Z"
}
```

**Data Source:** [GDACS RSS Feed](https://www.gdacs.org/xml/rss.xml)

---

## Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

1. Check if the bug is already reported in Issues
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

Open an issue with the "feature request" label describing:
- The problem you want to solve
- Your proposed solution
- Any alternatives you considered

### Code Contributions

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use TypeScript for all new files
- Follow existing naming conventions
- Add comments for complex logic
- Ensure accessibility (ARIA labels, semantic HTML)

---

## Deployment

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click "Deploy"

That's it! Vercel handles everything automatically.

### Manual Deployment

1. Build the app:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

### Live Demo

**Production URL:** [https://vercel.com/gvn2307s-projects/v0-crisiscoordination](https://vercel.com/gvn2307s-projects/v0-crisiscoordination)

---

## Troubleshooting

### Map not loading?
- Check if JavaScript is enabled in your browser
- Try refreshing the page
- Check browser console for errors

### Location not working?
- Make sure you allowed location permissions
- Check that you're using HTTPS (required for geolocation)
- Try clicking the location button on the map

### Chat not showing messages?
- Messages are simulated for demo purposes
- Switch between zones to see different messages
- Send a message to test functionality

---

## License

This project is open source and available under the MIT License.

---

## Acknowledgments

- **GDACS** - Global Disaster Alert and Coordination System for live data
- **OpenStreetMap** - Free map tiles and data
- **Leaflet.js** - Excellent open-source mapping library
- **shadcn/ui** - Beautiful accessible components
- **Vercel** - Hosting and deployment

---

## Contact

For questions or support, please open an issue on GitHub.

---

*Built with care for humanitarian purposes. Stay safe.*
