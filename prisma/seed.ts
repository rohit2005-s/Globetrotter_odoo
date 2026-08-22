import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Extended GlobeTrotter Database...");

  // Clean existing data
  await prisma.tripLike.deleteMany({});
  await prisma.savedDestination.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.stopActivity.deleteMany({});
  await prisma.stop.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // Users
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@globetrotter.com",
      passwordHash,
      name: "Alex Morgan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      bio: "Passionate globetrotter, photographer, and coffee enthusiast exploring one country at a time.",
      homeCountry: "United States",
      currency: "USD",
      language: "English",
      role: "USER",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@globetrotter.com",
      passwordHash,
      name: "Eleanor Vance (Admin)",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      bio: "GlobeTrotter Lead Operations & Travel Curator.",
      homeCountry: "United Kingdom",
      currency: "EUR",
      language: "English",
      role: "ADMIN",
    },
  });

  const traveler2 = await prisma.user.create({
    data: {
      email: "sarah.chen@globetrotter.com",
      passwordHash,
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
      bio: "Backpacker and food vlogger on a mission to taste every street delicacy.",
      homeCountry: "Singapore",
      currency: "USD",
      language: "English",
      role: "USER",
    },
  });

  const traveler3 = await prisma.user.create({
    data: {
      email: "marcus.v@globetrotter.com",
      passwordHash,
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      bio: "Mountain climber and outdoor filmmaker.",
      homeCountry: "Canada",
      currency: "CAD",
      language: "English",
      role: "USER",
    },
  });

  const citiesData = [
    {
      name: "Paris",
      country: "France",
      region: "Europe",
      coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
      description: "The City of Light dazzles with iconic monuments, world-class gastronomy, haute couture, and romantic Seine river cruises.",
      costIndex: "LUXURY",
      avgDailyCost: 180,
      rating: 4.9,
      popularSeason: "Spring & Autumn",
      currencyCode: "EUR",
      lat: 48.8566,
      lng: 2.3522,
      activities: [
        {
          title: "Louvre Museum Guided Tour & Mona Lisa",
          description: "Skip-the-line access through world-renowned masterpieces with an expert art historian.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1565099824688-e93eb20fe622?w=600&auto=format&fit=crop&q=80",
          cost: 65,
          durationHours: 3.0,
          rating: 4.9,
          location: "Rue de Rivoli, 75001 Paris",
        },
        {
          title: "Sunset Eiffel Tower Summit & Champagne",
          description: "Breathtaking panoramic sunset views over Paris from the highest deck of the Iron Lady.",
          category: "SIGHTSEEING",
          image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&auto=format&fit=crop&q=80",
          cost: 45,
          durationHours: 2.0,
          rating: 4.8,
          location: "Champ de Mars, 5 Av. Anatole France",
        },
        {
          title: "Montmartre Bohemian Food & Wine Walk",
          description: "Savor artisanal cheeses, freshly baked baguettes, macarons, and French wines in artists' quarter.",
          category: "FOOD",
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
          cost: 85,
          durationHours: 3.5,
          rating: 4.95,
          location: "Place du Tertre, Montmartre",
        },
        {
          title: "Seine River Romantic Evening Cruise",
          description: "Illuminated Parisian monuments viewed smoothly from an open-air glass cruise boat.",
          category: "NIGHTLIFE",
          image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80",
          cost: 30,
          durationHours: 1.5,
          rating: 4.7,
          location: "Port de la Bourdonnais",
        },
      ],
    },
    {
      name: "Tokyo",
      country: "Japan",
      region: "Asia",
      coverImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
      description: "A neon-lit metropolis seamlessly blending futuristic bullet trains, robotics, and pop culture with ancient shrines and tranquil tea gardens.",
      costIndex: "MODERATE",
      avgDailyCost: 140,
      rating: 4.95,
      popularSeason: "Spring (Cherry Blossoms)",
      currencyCode: "JPY",
      lat: 35.6762,
      lng: 139.6503,
      activities: [
        {
          title: "Tsukiji Outer Market Gourmet Food Tasting",
          description: "Freshly sliced sashimi, grilled wagyu skewers, tamagoyaki, and matcha desserts.",
          category: "FOOD",
          image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
          cost: 50,
          durationHours: 2.5,
          rating: 4.9,
          location: "Tsukiji, Chuo City",
        },
        {
          title: "teamLab Planets Immersive Digital Art",
          description: "Walk through water and body-immersive glowing digital light installations.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&auto=format&fit=crop&q=80",
          cost: 38,
          durationHours: 2.0,
          rating: 4.85,
          location: "Toyosu, Koto City",
        },
        {
          title: "Shibuya Crossing & Harajuku Vintage Hunt",
          description: "Experience the world's busiest crosswalk, Takeshita Street fashion, and hidden alleys.",
          category: "SIGHTSEEING",
          image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&auto=format&fit=crop&q=80",
          cost: 20,
          durationHours: 3.0,
          rating: 4.8,
          location: "Shibuya & Jingumae",
        },
        {
          title: "Shinjuku Golden Gai Micro-Bar Hopping",
          description: "Explore intimate 6-seater retro wooden bars in historic Shinjuku nightlife district.",
          category: "NIGHTLIFE",
          image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
          cost: 60,
          durationHours: 3.0,
          rating: 4.75,
          location: "Kabukicho, Shinjuku",
        },
      ],
    },
    {
      name: "Rome",
      country: "Italy",
      region: "Europe",
      coverImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80",
      description: "The Eternal City boasts over two millennia of history, gladiatorial arenas, Vatican treasures, and irresistible handmade pasta.",
      costIndex: "MODERATE",
      avgDailyCost: 130,
      rating: 4.9,
      popularSeason: "Spring & Summer",
      currencyCode: "EUR",
      lat: 41.9028,
      lng: 12.4964,
      activities: [
        {
          title: "Colosseum, Roman Forum & Palatine Hill Tour",
          description: "Step into the arena floor and walk the ancient pathways of Roman emperors.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80",
          cost: 55,
          durationHours: 3.5,
          rating: 4.9,
          location: "Piazza del Colosseo",
        },
        {
          title: "Trastevere Street Food & Wine Trail",
          description: "Crispy supplì, woodfired Roman pizza, artisanal gelato, and local organic Chianti.",
          category: "FOOD",
          image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&auto=format&fit=crop&q=80",
          cost: 70,
          durationHours: 3.0,
          rating: 4.92,
          location: "Piazza di Santa Maria in Trastevere",
        },
        {
          title: "Vatican Museums & Sistine Chapel Tour",
          description: "Marvel at Michelangelo's celestial frescoes and Raphael's Rooms with priority entrance.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1548625361-16a7f4577f86?w=600&auto=format&fit=crop&q=80",
          cost: 75,
          durationHours: 3.0,
          rating: 4.88,
          location: "Viale Vaticano",
        },
      ],
    },
    {
      name: "Barcelona",
      country: "Spain",
      region: "Europe",
      coverImage: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80",
      description: "Catalan cosmopolitan charm featuring Antoni Gaudí's whimsical architecture, lively Mediterranean beaches, and tapas bars.",
      costIndex: "MODERATE",
      avgDailyCost: 125,
      rating: 4.85,
      popularSeason: "May to October",
      currencyCode: "EUR",
      lat: 41.3879,
      lng: 2.1699,
      activities: [
        {
          title: "Sagrada Família Fast-Track Tower Access",
          description: "Admire Gaudí's unfinished basilica masterpiece and climb the Nativity or Passion towers.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&auto=format&fit=crop&q=80",
          cost: 40,
          durationHours: 2.0,
          rating: 4.95,
          location: "C/ de Mallorca, 401",
        },
        {
          title: "Gothic Quarter Tapas & Flamenco Show",
          description: "Intimate live flamenco rhythm in historic vaults paired with sangria and Iberian ham.",
          category: "NIGHTLIFE",
          image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
          cost: 65,
          durationHours: 3.0,
          rating: 4.8,
          location: "Barri Gòtic",
        },
        {
          title: "Barceloneta Beach Paddleboarding & Kayak",
          description: "Glide on crystal blue Mediterranean waters along Barcelona's iconic coastline.",
          category: "ADVENTURE",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
          cost: 35,
          durationHours: 2.0,
          rating: 4.7,
          location: "Platja de la Barceloneta",
        },
      ],
    },
    {
      name: "New York City",
      country: "United States",
      region: "Americas",
      coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80",
      description: "The city that never sleeps, radiating energy across Broadway theaters, Central Park, towering skyscrapers, and world-class museums.",
      costIndex: "LUXURY",
      avgDailyCost: 240,
      rating: 4.9,
      popularSeason: "Autumn & Holiday Season",
      currencyCode: "USD",
      lat: 40.7128,
      lng: -74.006,
      activities: [
        {
          title: "Broadway Musical Premier Show",
          description: "Experience award-winning theater performances in the heart of Times Square.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80",
          cost: 130,
          durationHours: 3.0,
          rating: 4.95,
          location: "Theater District, Manhattan",
        },
        {
          title: "Central Park Guided Bike & Hidden Gems Tour",
          description: "Pedal past Bethesda Terrace, Strawberry Fields, Bow Bridge, and Belvedere Castle.",
          category: "NATURE",
          image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80",
          cost: 45,
          durationHours: 2.5,
          rating: 4.85,
          location: "Central Park South",
        },
      ],
    },
    {
      name: "Bali",
      country: "Indonesia",
      region: "Asia",
      coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
      description: "Island of the Gods known for emerald rice terraces, cliffside ocean temples, surfing spots, and holistic yoga retreats.",
      costIndex: "BUDGET",
      avgDailyCost: 55,
      rating: 4.9,
      popularSeason: "May to September",
      currencyCode: "IDR",
      lat: -8.3405,
      lng: 115.092,
      activities: [
        {
          title: "Mount Batur Sunrise Volcano Hike & Breakfast",
          description: "Trek under the stars and watch golden dawn break above volcanic clouds with steam-cooked eggs.",
          category: "ADVENTURE",
          image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&auto=format&fit=crop&q=80",
          cost: 45,
          durationHours: 6.0,
          rating: 4.95,
          location: "Kintamani, Bangli",
        },
        {
          title: "Ubud Sacred Monkey Forest & Rice Terrace Swing",
          description: "Meet playful macaques and soar high above lush Tegallalang terraced valley.",
          category: "NATURE",
          image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80",
          cost: 30,
          durationHours: 4.0,
          rating: 4.8,
          location: "Jl. Monkey Forest, Ubud",
        },
      ],
    },
    {
      name: "Dubai",
      country: "United Arab Emirates",
      region: "Middle East",
      coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
      description: "Futuristic luxury playground featuring record-breaking skyscrapers, mega malls, desert safaris, and artificial palm islands.",
      costIndex: "LUXURY",
      avgDailyCost: 220,
      rating: 4.8,
      popularSeason: "November to March",
      currencyCode: "AED",
      lat: 25.2048,
      lng: 55.2708,
      activities: [
        {
          title: "Red Dunes Desert Safari, Dune Bashing & BBQ Show",
          description: "4x4 sand dune roller coaster, sandboarding, camel rides, and starlit Bedouin feast.",
          category: "ADVENTURE",
          image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600&auto=format&fit=crop&q=80",
          cost: 75,
          durationHours: 6.0,
          rating: 4.9,
          location: "Lahbab Desert",
        },
      ],
    },
    {
      name: "London",
      country: "United Kingdom",
      region: "Europe",
      coverImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80",
      description: "Historic British capital packed with royal palaces, red double-deckers, world-leading free museums, and vibrant boroughs.",
      costIndex: "LUXURY",
      avgDailyCost: 190,
      rating: 4.85,
      popularSeason: "May to September",
      currencyCode: "GBP",
      lat: 51.5074,
      lng: -0.1278,
      activities: [
        {
          title: "Tower of London & Crown Jewels Tour",
          description: "Uncover royal history, medieval fortresses, and sparkling historic coronation regalia.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80",
          cost: 42,
          durationHours: 2.5,
          rating: 4.8,
          location: "Tower Hill, EC3N 4AB",
        },
      ],
    },
    {
      name: "Kyoto",
      country: "Japan",
      region: "Asia",
      coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
      description: "Japan's cultural heartland filled with thousands of classical Buddhist temples, gardens, imperial palaces, and geisha traditions.",
      costIndex: "MODERATE",
      avgDailyCost: 110,
      rating: 4.95,
      popularSeason: "Spring & Autumn (Foliage)",
      currencyCode: "JPY",
      lat: 35.0116,
      lng: 135.7681,
      activities: [
        {
          title: "Fushimi Inari Shrine 10,000 Torii Gates Hike",
          description: "Wander through the vermillion shrine tunnel climbing up holy Mount Inari.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80",
          cost: 25,
          durationHours: 3.0,
          rating: 4.98,
          location: "Fushimi-ku, Kyoto",
        },
      ],
    },
    {
      name: "Cairo",
      country: "Egypt",
      region: "Africa",
      coverImage: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&auto=format&fit=crop&q=80",
      description: "Cradle of ancient civilization where colossal pyramids, sphinxes, and historic Nile river cruise ports meet vibrant bazaars.",
      costIndex: "BUDGET",
      avgDailyCost: 60,
      rating: 4.75,
      popularSeason: "October to April",
      currencyCode: "EGP",
      lat: 30.0444,
      lng: 31.2357,
      activities: [
        {
          title: "Giza Pyramids & Great Sphinx Private Guide & Camel Ride",
          description: "Stand before the last remaining Wonder of the Ancient World with an Egyptologist guide.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&auto=format&fit=crop&q=80",
          cost: 50,
          durationHours: 4.5,
          rating: 4.9,
          location: "Al Haram, Giza Governorate",
        },
      ],
    },
    {
      name: "Amsterdam",
      country: "Netherlands",
      region: "Europe",
      coverImage: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&auto=format&fit=crop&q=80",
      description: "Charming canal city famed for its artistic heritage, elaborate canal systems, bicycle culture, and narrow gabled houses.",
      costIndex: "MODERATE",
      avgDailyCost: 150,
      rating: 4.8,
      popularSeason: "April to September",
      currencyCode: "EUR",
      lat: 52.3676,
      lng: 4.9041,
      activities: [
        {
          title: "Van Gogh Museum & Rijksmuseum Masterpieces",
          description: "Explore the Sunflowers, Starry Night sketches, and Rembrandt's Night Watch.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?w=600&auto=format&fit=crop&q=80",
          cost: 50,
          durationHours: 3.5,
          rating: 4.9,
          location: "Museumplein 6",
        },
      ],
    },
    {
      name: "Sydney",
      country: "Australia",
      region: "Oceania",
      coverImage: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80",
      description: "Iconic harbour city with magnificent coastal walks, world-famous Opera House, sunny Bondi surf culture, and pristine parks.",
      costIndex: "LUXURY",
      avgDailyCost: 180,
      rating: 4.85,
      popularSeason: "December to March",
      currencyCode: "AUD",
      lat: -33.8688,
      lng: 151.2093,
      activities: [
        {
          title: "Sydney Harbour Bridge Climb Experience",
          description: "Scale to the top of the steel arch 134 meters above sea level for 360-degree harbour vistas.",
          category: "ADVENTURE",
          image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80",
          cost: 160,
          durationHours: 3.5,
          rating: 4.95,
          location: "3 Cumberland St, The Rocks",
        },
      ],
    },
    {
      name: "Bangkok",
      country: "Thailand",
      region: "Asia",
      coverImage: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80",
      description: "Exciting sensory hub with ornate shrines, buzzing street life, floating markets, rooftop skybars, and spicy world-class cuisine.",
      costIndex: "BUDGET",
      avgDailyCost: 50,
      rating: 4.8,
      popularSeason: "November to February",
      currencyCode: "THB",
      lat: 13.7563,
      lng: 100.5018,
      activities: [
        {
          title: "Grand Palace & Wat Pho Reclining Buddha Tour",
          description: "Admire gleaming golden stupas and the majestic 46m gilded reclining Buddha statue.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&auto=format&fit=crop&q=80",
          cost: 35,
          durationHours: 3.0,
          rating: 4.85,
          location: "Na Phra Lan Rd, Phra Borom Maha Ratchawang",
        },
      ],
    },
    {
      name: "Reykjavik",
      country: "Iceland",
      region: "Europe",
      coverImage: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format&fit=crop&q=80",
      description: "Gateway to the land of fire and ice: geothermal hot springs, glaciers, cascading waterfalls, and glowing Northern Lights.",
      costIndex: "LUXURY",
      avgDailyCost: 210,
      rating: 4.9,
      popularSeason: "September to April (Auroras)",
      currencyCode: "ISK",
      lat: 64.1466,
      lng: -21.9426,
      activities: [
        {
          title: "Golden Circle & Kerid Volcanic Crater Tour",
          description: "Witness explosive Strokkur Geysir, roaring Gullfoss waterfall, and Thingvellir tectonic rift.",
          category: "NATURE",
          image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&auto=format&fit=crop&q=80",
          cost: 85,
          durationHours: 7.0,
          rating: 4.95,
          location: "Thingvellir National Park",
        },
      ],
    },
    {
      name: "Rio de Janeiro",
      country: "Brazil",
      region: "Americas",
      coverImage: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80",
      description: "Vibrant coastal metropolis flanked by dramatic granite peaks, samba rhythms, Copacabana sands, and Christ the Redeemer.",
      costIndex: "BUDGET",
      avgDailyCost: 75,
      rating: 4.8,
      popularSeason: "December to March (Carnival)",
      currencyCode: "BRL",
      lat: -22.9068,
      lng: -43.1729,
      activities: [
        {
          title: "Christ the Redeemer & Sugarloaf Cable Car Sunset",
          description: "Panoramic view of Guanabara Bay and Rio's emerald mountains from Corcovado peak.",
          category: "SIGHTSEEING",
          image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&auto=format&fit=crop&q=80",
          cost: 65,
          durationHours: 5.0,
          rating: 4.9,
          location: "Parque Nacional da Tijuca",
        },
      ],
    },
    {
      name: "Cape Town",
      country: "South Africa",
      region: "Africa",
      coverImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80",
      description: "Dramatic coastal beauty where Table Mountain looms over Atlantic beaches, vineyards, and penguin colonies.",
      costIndex: "BUDGET",
      avgDailyCost: 80,
      rating: 4.88,
      popularSeason: "November to March",
      currencyCode: "ZAR",
      lat: -33.9249,
      lng: 18.4241,
      activities: [
        {
          title: "Table Mountain Cableway & Summit Trek",
          description: "Ride the rotating cable car and hike the flat top mountain overlooking two oceans.",
          category: "NATURE",
          image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&auto=format&fit=crop&q=80",
          cost: 35,
          durationHours: 3.5,
          rating: 4.92,
          location: "Table Mountain National Park",
        },
      ],
    },
    {
      name: "Singapore",
      country: "Singapore",
      region: "Asia",
      coverImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80",
      description: "Garden city marvel showcasing Supertree Groves, world-leading hawker centers, Marina Bay skyline, and pristine lush greenery.",
      costIndex: "LUXURY",
      avgDailyCost: 175,
      rating: 4.92,
      popularSeason: "Year-Round",
      currencyCode: "SGD",
      lat: 1.3521,
      lng: 103.8198,
      activities: [
        {
          title: "Gardens by the Bay & Cloud Forest Dome",
          description: "Explore the futuristic Supertrees and 35-meter indoor cascading waterfall.",
          category: "NATURE",
          image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80",
          cost: 40,
          durationHours: 3.0,
          rating: 4.95,
          location: "18 Marina Gardens Dr",
        },
      ],
    },
    {
      name: "San Francisco",
      country: "United States",
      region: "Americas",
      coverImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&auto=format&fit=crop&q=80",
      description: "Iconic Golden Gate vistas, historic rolling cable cars, tech innovation, sourdough bakeries, and breezy waterfront piers.",
      costIndex: "LUXURY",
      avgDailyCost: 210,
      rating: 4.82,
      popularSeason: "September to November",
      currencyCode: "USD",
      lat: 37.7749,
      lng: -122.4194,
      activities: [
        {
          title: "Alcatraz Island Historic Prison Audio Tour",
          description: "Ferry cruise across the bay to explore the legendary high-security island prison.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&auto=format&fit=crop&q=80",
          cost: 45,
          durationHours: 3.5,
          rating: 4.9,
          location: "Pier 33, The Embarcadero",
        },
      ],
    },
    {
      name: "Prague",
      country: "Czech Republic",
      region: "Europe",
      coverImage: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&auto=format&fit=crop&q=80",
      description: "The City of a Hundred Spires featuring Gothic churches, Charles Bridge statues, fairy-tale castles, and legendary Bohemian beer.",
      costIndex: "BUDGET",
      avgDailyCost: 85,
      rating: 4.86,
      popularSeason: "May to September",
      currencyCode: "CZK",
      lat: 50.0755,
      lng: 14.4378,
      activities: [
        {
          title: "Prague Castle & St. Vitus Cathedral Tour",
          description: "Tour the largest ancient castle complex in the world with panoramic city outlooks.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&auto=format&fit=crop&q=80",
          cost: 32,
          durationHours: 3.0,
          rating: 4.88,
          location: "Hradčany, 119 08 Prague 1",
        },
      ],
    },
    {
      name: "Marrakech",
      country: "Morocco",
      region: "Africa",
      coverImage: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&auto=format&fit=crop&q=80",
      description: "Sensory oasis with bustling Medina souks, vibrant spices, intricate tiled riads, and snake charmers at Jemaa el-Fnaa.",
      costIndex: "BUDGET",
      avgDailyCost: 65,
      rating: 4.78,
      popularSeason: "March to May & Autumn",
      currencyCode: "MAD",
      lat: 31.6295,
      lng: -7.9811,
      activities: [
        {
          title: "Jardin Majorelle & Yves Saint Laurent Museum",
          description: "Walk through cobalt blue architecture and exotic desert botanical gardens.",
          category: "CULTURE",
          image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&auto=format&fit=crop&q=80",
          cost: 28,
          durationHours: 2.0,
          rating: 4.85,
          location: "Rue Yves St Laurent",
        },
      ],
    },
  ];

  const createdCities: any[] = [];
  for (const cityData of citiesData) {
    const { activities, ...cityProps } = cityData;
    const city = await prisma.city.create({
      data: {
        ...cityProps,
        activities: {
          create: activities,
        },
      },
      include: {
        activities: true,
      },
    });
    createdCities.push(city);
  }

  const parisCity = createdCities.find((c) => c.name === "Paris")!;
  const romeCity = createdCities.find((c) => c.name === "Rome")!;
  const barcelonaCity = createdCities.find((c) => c.name === "Barcelona")!;
  const tokyoCity = createdCities.find((c) => c.name === "Tokyo")!;
  const kyotoCity = createdCities.find((c) => c.name === "Kyoto")!;

  // Demo Trip 1
  const trip1 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: "Grand European Summer Odyssey",
      description: "An unforgettable 10-day journey exploring the art of Paris, historic ruins of Rome, and coastal vibrant architecture of Barcelona.",
      coverImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&auto=format&fit=crop&q=80",
      startDate: new Date("2026-06-10T00:00:00.000Z"),
      endDate: new Date("2026-06-20T00:00:00.000Z"),
      totalBudget: 2800,
      currency: "EUR",
      status: "UPCOMING",
      isPublic: true,
      shareToken: "euro-odyssey-2026",
    },
  });

  const stop1 = await prisma.stop.create({
    data: {
      tripId: trip1.id,
      cityId: parisCity.id,
      orderIndex: 0,
      arrivalDate: new Date("2026-06-10T00:00:00.000Z"),
      departureDate: new Date("2026-06-13T00:00:00.000Z"),
      accommodationName: "Hotel Le Marais Boutique",
      accommodationCost: 450,
      notes: "Check-in at 2 PM. Pack comfortable walking shoes for museum day.",
    },
  });

  const stop2 = await prisma.stop.create({
    data: {
      tripId: trip1.id,
      cityId: romeCity.id,
      orderIndex: 1,
      arrivalDate: new Date("2026-06-13T00:00:00.000Z"),
      departureDate: new Date("2026-06-17T00:00:00.000Z"),
      accommodationName: "Residenza Navona Deluxe",
      accommodationCost: 520,
      notes: "Flight from Paris CDG to Rome FCO. Pre-book Vatican morning entry.",
    },
  });

  const stop3 = await prisma.stop.create({
    data: {
      tripId: trip1.id,
      cityId: barcelonaCity.id,
      orderIndex: 2,
      arrivalDate: new Date("2026-06-17T00:00:00.000Z"),
      departureDate: new Date("2026-06-20T00:00:00.000Z"),
      accommodationName: "Granvia Ocean View Suites",
      accommodationCost: 410,
      notes: "Enjoy beach sunsets and seaside tapas evenings.",
    },
  });

  if (parisCity.activities[0]) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop1.id,
        activityId: parisCity.activities[0].id,
        customCost: parisCity.activities[0].cost,
        scheduledDate: new Date("2026-06-11T09:30:00.000Z"),
        timeSlot: "MORNING",
        customTime: "09:30 AM",
        notes: "Enter via Carrousel entrance to avoid main pyramid queue.",
        orderIndex: 0,
      },
    });
  }

  if (parisCity.activities[1]) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop1.id,
        activityId: parisCity.activities[1].id,
        customCost: parisCity.activities[1].cost,
        scheduledDate: new Date("2026-06-11T18:00:00.000Z"),
        timeSlot: "EVENING",
        customTime: "06:00 PM",
        notes: "Watch the golden hour lights sparkle on the hour.",
        orderIndex: 1,
      },
    });
  }

  if (romeCity.activities[0]) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop2.id,
        activityId: romeCity.activities[0].id,
        customCost: romeCity.activities[0].cost,
        scheduledDate: new Date("2026-06-14T09:00:00.000Z"),
        timeSlot: "MORNING",
        customTime: "09:00 AM",
        notes: "Wear sun hat and carry refillable water bottle for Roman fountains.",
        orderIndex: 0,
      },
    });
  }

  if (barcelonaCity.activities[0]) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop3.id,
        activityId: barcelonaCity.activities[0].id,
        customCost: barcelonaCity.activities[0].cost,
        scheduledDate: new Date("2026-06-18T10:00:00.000Z"),
        timeSlot: "MORNING",
        customTime: "10:00 AM",
        notes: "Audio guide app pre-downloaded on smartphone.",
        orderIndex: 0,
      },
    });
  }

  await prisma.expense.createMany({
    data: [
      {
        tripId: trip1.id,
        stopId: stop1.id,
        title: "Flights (NYC to Paris & Return from BCN)",
        category: "TRANSPORT",
        amount: 680,
        date: new Date("2026-06-10T00:00:00.000Z"),
        notes: "Round trip international ticket",
      },
      {
        tripId: trip1.id,
        stopId: stop1.id,
        title: "Hotel Le Marais (3 Nights)",
        category: "ACCOMMODATION",
        amount: 450,
        date: new Date("2026-06-10T00:00:00.000Z"),
      },
      {
        tripId: trip1.id,
        stopId: stop2.id,
        title: "Residenza Navona (4 Nights)",
        category: "ACCOMMODATION",
        amount: 520,
        date: new Date("2026-06-13T00:00:00.000Z"),
      },
      {
        tripId: trip1.id,
        stopId: stop3.id,
        title: "Granvia Ocean View (3 Nights)",
        category: "ACCOMMODATION",
        amount: 410,
        date: new Date("2026-06-17T00:00:00.000Z"),
      },
      {
        tripId: trip1.id,
        title: "Inter-city Flights (Paris -> Rome -> Barcelona)",
        category: "TRANSPORT",
        amount: 220,
        date: new Date("2026-06-13T00:00:00.000Z"),
      },
      {
        tripId: trip1.id,
        title: "Food & Dining Allowance (10 days)",
        category: "FOOD",
        amount: 320,
        date: new Date("2026-06-12T00:00:00.000Z"),
      },
    ],
  });

  // Trip 2: Japan
  const trip2 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: "Japan: Neon Skies & Zen Gardens",
      description: "Exploring vibrant Tokyo sushi counters, Akihabara gadgets, and serene Kyoto bamboo groves.",
      coverImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80",
      startDate: new Date("2026-09-05T00:00:00.000Z"),
      endDate: new Date("2026-09-14T00:00:00.000Z"),
      totalBudget: 2400,
      currency: "USD",
      status: "UPCOMING",
      isPublic: true,
      shareToken: "japan-zen-2026",
    },
  });

  await prisma.stop.create({
    data: {
      tripId: trip2.id,
      cityId: tokyoCity.id,
      orderIndex: 0,
      arrivalDate: new Date("2026-09-05T00:00:00.000Z"),
      departureDate: new Date("2026-09-10T00:00:00.000Z"),
      accommodationName: "Shinjuku Granbell Modern",
      accommodationCost: 550,
    },
  });

  await prisma.stop.create({
    data: {
      tripId: trip2.id,
      cityId: kyotoCity.id,
      orderIndex: 1,
      arrivalDate: new Date("2026-09-10T00:00:00.000Z"),
      departureDate: new Date("2026-09-14T00:00:00.000Z"),
      accommodationName: "Kyoto Ryokan Gion Traditional",
      accommodationCost: 480,
    },
  });

  // Trip 3 for Sarah Chen
  const baliCity = createdCities.find((c) => c.name === "Bali")!;
  const trip3 = await prisma.trip.create({
    data: {
      userId: traveler2.id,
      title: "Tropical Bali Escape & Wellness",
      description: "Yoga retreats, waterfalls, volcanic sunrise treks, and beachside fruit bowls.",
      coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80",
      startDate: new Date("2026-07-01T00:00:00.000Z"),
      endDate: new Date("2026-07-08T00:00:00.000Z"),
      totalBudget: 1200,
      currency: "USD",
      status: "COMPLETED",
      isPublic: true,
      shareToken: "bali-escape-2026",
    },
  });

  await prisma.stop.create({
    data: {
      tripId: trip3.id,
      cityId: baliCity.id,
      orderIndex: 0,
      arrivalDate: new Date("2026-07-01T00:00:00.000Z"),
      departureDate: new Date("2026-07-08T00:00:00.000Z"),
      accommodationName: "Ubud Jungle Eco Resort",
      accommodationCost: 350,
    },
  });

  // Saved Destinations
  await prisma.savedDestination.createMany({
    data: [
      { userId: demoUser.id, cityId: parisCity.id },
      { userId: demoUser.id, cityId: tokyoCity.id },
      { userId: demoUser.id, cityId: baliCity.id },
      { userId: demoUser.id, cityId: createdCities.find((c) => c.name === "Reykjavik")!.id },
      { userId: demoUser.id, cityId: createdCities.find((c) => c.name === "Cape Town")!.id },
    ],
  });

  // Likes
  await prisma.tripLike.createMany({
    data: [
      { userId: traveler2.id, tripId: trip1.id },
      { userId: traveler3.id, tripId: trip1.id },
      { userId: demoUser.id, tripId: trip3.id },
    ],
  });

  console.log(`🎉 Database Seeding Completed with ${createdCities.length} Global Cities & Curated Trips!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
