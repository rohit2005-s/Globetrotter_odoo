# GlobeTrotter – Empowering Personalized Travel Planning

> **Odoo Hackathon Solution**
> An end-to-end, intelligent, and interactive travel planning platform built with Next.js 14, React, TypeScript, Tailwind CSS, and Prisma Relational ORM.

---

## 🌟 Overview & Problem Statement Alignment

GlobeTrotter solves the complexity of planning multi-city travel by providing travelers with intuitive tools to:
- **Add and manage travel stops & durations** (Multi-city itinerary routing).
- **Explore cities and activities of interest** (Rich catalog of global destinations and curated experiences).
- **Estimate trip budgets automatically** (Categorized breakdowns, Recharts Pie & Bar charts, and overbudget alerts).
- **Visualize timelines and plans** (Day-by-day structured layouts, printable views, and vertical chronological timelines).
- **Share trip plans with others** (Public shareable links, WhatsApp / Twitter sharing, and 1-click **"Copy Trip to My Account"** cloning).

---

## 🧭 Feature & Screen Implementation Index

All **13 screens and specifications** detailed in the hackathon problem statement have been built:

| Screen # | Screen Name | Key Features |
|---|---|---|
| **1** | **Login / Signup** | Email & password authentication, validation, "Forgot Password", and **1-Click Instant Demo Login** (Traveler / Admin). |
| **2** | **Dashboard / Home** | Welcome banner, traveler statistics, upcoming trips carousel, curated destinations, and budget tracker highlights. |
| **3** | **Create Trip** | Multi-city destination picker, start & end date selector with live duration calculation, budget allocation, curated cover photo gallery, and privacy controls. |
| **4** | **My Trips (Trip List)** | Grid and Table view toggles, status filters (*Upcoming, Ongoing, Completed, Draft*), search bar, budget progress bars, and actions (*View, Edit, Clone, Delete*). |
| **5** | **Itinerary Builder** | Core interactive tool: Add city stops, reorder routes (move up/down), add activities from city catalog or custom inputs, assign time slots (*Morning, Afternoon, Evening, Night*), and track live costs. |
| **6** | **Itinerary View** | Day-by-day structured master itinerary, city headers with accommodation details, activity cards with time and cost pills, and **1-click Print / PDF export**. |
| **7** | **City Search & Discovery** | Global search, region filters (*Europe, Asia, Americas, Africa, Middle East, Oceania*), cost indices (*$, $$, $$$*), wishlist heart toggles, and modal quick views. |
| **8** | **Activity Search & Catalog** | Browse experiences across categories (*Sightseeing, Food, Adventure, Culture, Nature, Nightlife*), cost filters, and **Add to My Trip** modal linking directly to itinerary stops. |
| **9** | **Trip Budget & Cost Breakdown** | Visual financial dashboard: Total estimated vs. target budget gauge, 5 category summaries (*Stay, Transport, Activities, Food, Misc*), **Recharts Pie Chart**, **Recharts Daily Bar Chart**, daily average spend, overbudget alerts, and custom expense ledger. |
| **10** | **Trip Calendar / Timeline** | Vertical chronological route timeline connecting each city and scheduled activity with visual path connectors and date blocks. |
| **11** | **Shared / Public Itinerary** | Publicly accessible read-only view via unique tokens, creator badge, route summary, social sharing (*WhatsApp, Twitter/X, Copy Link*), and **"Copy Trip to My Account"** button. |
| **12** | **User Profile / Settings** | Profile editor (*Name, Avatar, Bio, Country*), currency preference (*USD, EUR, GBP, JPY, INR, AUD, CAD, SGD, AED*), language settings, travel statistics, and saved destinations wishlist. |
| **13** | **Admin / Analytics Dashboard** *(Bonus)* | Platform metrics (*Total Users, Trips, Stops, Budget Volume*), interactive bar chart for top visited cities, category distribution pie chart, user directory, and database management to insert new cities and activities. |

---

## 🗄️ Relational Database Schema

Powered by **Prisma ORM** with full relational integrity and foreign keys:

- `User`: Travelers & Administrators with preferences and avatars.
- `Trip`: Relational parent holding title, dates, budget, status, and public share tokens.
- `Stop`: City stop node in an itinerary with order index, arrival/departure dates, and accommodation.
- `City`: Global destinations with coordinates, cost indices, ratings, and popular seasons.
- `Activity`: Catalog of attractions and tours belonging to cities.
- `StopActivity`: Scheduled activity within a trip stop with date, time slot, cost, and completion state.
- `Expense`: Logged expenses categorized by Transport, Accommodation, Activities, Food, and Misc.
- `SavedDestination`: Wishlist relations between Users and Cities.
- `TripLike`: Community likes on public itineraries.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/rohit2005-s/Globetrotter_odoo.git
cd Globetrotter_odoo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create your local `.env` file from the provided example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

The application uses the following environment variables:

- `DATABASE_URL` – SQLite database connection
- `JWT_SECRET` – secret used for JWT authentication
- `NEXT_PUBLIC_APP_URL` – application base URL

For local development, the default values in `.env.example` can be used.

### 4. Initialize the Database

```bash
npx prisma db push
```

### 5. Seed Demo Data

```bash
npx tsx prisma/seed.ts
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo & Judging Credentials

For convenience during hackathon judging, the application includes a **1-Click Instant Demo Login Bar** on the navigation header and modal:

- **Traveler Account**: `demo@globetrotter.com` / `password123` (Alex Morgan)
- **Admin Account**: `admin@globetrotter.com` / `password123` (Eleanor Vance)
