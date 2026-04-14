"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Compass,
  CreditCard,
  Expand,
  FolderKanban,
  Globe,
  Heart,
  House,
  Lock,
  Mail,
  MapPin,
  Moon,
  PenSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Tag,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

type ThemeMode = "light" | "dark";
type AppStage = "signin_details" | "signin_payment" | "signin_confirmation" | "app";
type PageKey =
  | "home"
  | "favorites"
  | "projects"
  | "settings"
  | "account_info"
  | "answers_summary"
  | "questionnaire"
  | "project_detail";
type PlanKey = "starter" | "pro" | "skip";
type ProjectsTab = "projects" | "my_projects";
type MapMode = "mini" | "full";

type SharedProject = {
  id: number;
  title: string;
  creator: string;
  category: string;
  location: string;
  description: string;
  tags: string[];
  profileKeywords: string[];
  thumbnail?: string;
  score?: number;
  reasons?: string[];
  lat: number;
  lng: number;
  visibility: "public";
};

type UserProject = {
  id: number;
  title: string;
  creator: string;
  category: string;
  location: string;
  description: string;
  tags: string[];
  visibility: "private" | "public";
  thumbnail?: string;
};

type Project = SharedProject | UserProject;

type Question = {
  id: string;
  category: string;
  type: "select" | "textarea";
  label: string;
  options?: string[];
  placeholder?: string;
};

type ThemeStyles = {
  appBg: string;
  panel: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  pill: string;
  shadow: string;
};

type RegionData = {
  name: string;
  cities: string[];
};

type CountryData = {
  regionLabel: string;
  cityLabel?: string;
  regions: RegionData[];
};

type LocationData = Record<string, Record<string, CountryData>>;

type LeafletModule = typeof import("leaflet");

type MapViewProps = {
  mode: MapMode;
  projects: SharedProject[];
  highlightedIds: number[];
  activeProjectId: number | null;
  onSelectProject?: (project: SharedProject) => void;
  onOpenFullscreen?: () => void;
  themeStyles: ThemeStyles;
};

const LOCATION_DATA: LocationData = {
  Africa: {
    Egypt: {
      regionLabel: "Governorate",
      cityLabel: "City",
      regions: [
        { name: "Cairo Governorate", cities: ["Cairo", "Heliopolis", "Nasr City"] },
        { name: "Alexandria Governorate", cities: ["Alexandria", "Borg El Arab"] },
        { name: "Giza Governorate", cities: ["Giza", "6th of October City", "Sheikh Zayed City"] },
      ],
    },
    Kenya: {
      regionLabel: "County",
      cityLabel: "City / Town",
      regions: [
        { name: "Nairobi County", cities: ["Nairobi", "Karen", "Westlands"] },
        { name: "Mombasa County", cities: ["Mombasa", "Likoni"] },
        { name: "Kiambu County", cities: ["Kiambu", "Thika", "Ruiru"] },
      ],
    },
    Morocco: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Casablanca-Settat", cities: ["Casablanca", "Mohammedia", "Settat"] },
        { name: "Rabat-Salé-Kénitra", cities: ["Rabat", "Salé", "Kénitra"] },
        { name: "Marrakesh-Safi", cities: ["Marrakesh", "Essaouira"] },
      ],
    },
    Nigeria: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "Lagos", cities: ["Lagos", "Ikeja", "Lekki"] },
        { name: "Abuja FCT", cities: ["Abuja", "Gwagwalada"] },
        { name: "Rivers", cities: ["Port Harcourt"] },
      ],
    },
    "South Africa": {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Sandton"] },
        { name: "Western Cape", cities: ["Cape Town", "Stellenbosch"] },
        { name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg"] },
      ],
    },
  },
  Asia: {
    India: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nashik"] },
        { name: "Karnataka", cities: ["Bengaluru", "Mysuru"] },
        { name: "Delhi", cities: ["New Delhi", "Delhi"] },
      ],
    },
    Indonesia: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Jakarta", cities: ["Jakarta", "Central Jakarta"] },
        { name: "Bali", cities: ["Denpasar", "Ubud"] },
        { name: "West Java", cities: ["Bandung", "Bekasi"] },
      ],
    },
    Israel: {
      regionLabel: "District",
      cityLabel: "City",
      regions: [
        { name: "Tel Aviv District", cities: ["Tel Aviv", "Ramat Gan", "Herzliya"] },
        { name: "Jerusalem District", cities: ["Jerusalem", "Beit Shemesh"] },
        { name: "Northern District", cities: ["Haifa", "Nazareth", "Tiberias"] },
      ],
    },
    Japan: {
      regionLabel: "Prefecture",
      cityLabel: "City",
      regions: [
        { name: "Tokyo", cities: ["Tokyo", "Shibuya", "Shinjuku"] },
        { name: "Osaka", cities: ["Osaka", "Sakai"] },
        { name: "Kyoto", cities: ["Kyoto", "Uji"] },
      ],
    },
    Singapore: {
      regionLabel: "Region",
      cityLabel: "Area / City",
      regions: [
        { name: "Central Region", cities: ["Singapore", "Orchard", "Marina Bay"] },
        { name: "East Region", cities: ["Tampines", "Pasir Ris"] },
        { name: "North Region", cities: ["Woodlands", "Yishun"] },
      ],
    },
    "South Korea": {
      regionLabel: "Province / Metro",
      cityLabel: "City",
      regions: [
        { name: "Seoul", cities: ["Seoul", "Gangnam", "Mapo"] },
        { name: "Busan", cities: ["Busan", "Haeundae"] },
        { name: "Gyeonggi", cities: ["Suwon", "Seongnam", "Goyang"] },
      ],
    },
    Thailand: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Bangkok", cities: ["Bangkok"] },
        { name: "Chiang Mai", cities: ["Chiang Mai"] },
        { name: "Phuket", cities: ["Phuket", "Patong"] },
      ],
    },
    "United Arab Emirates": {
      regionLabel: "Emirate",
      cityLabel: "City",
      regions: [
        { name: "Dubai", cities: ["Dubai"] },
        { name: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain"] },
        { name: "Sharjah", cities: ["Sharjah"] },
      ],
    },
  },
  Europe: {
    France: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Île-de-France", cities: ["Paris", "Versailles", "Boulogne-Billancourt"] },
        { name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Cannes"] },
        { name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble"] },
      ],
    },
    Germany: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "Bavaria", cities: ["Munich", "Nuremberg"] },
        { name: "Berlin", cities: ["Berlin"] },
        { name: "Hesse", cities: ["Frankfurt", "Wiesbaden"] },
      ],
    },
    Italy: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Lazio", cities: ["Rome"] },
        { name: "Lombardy", cities: ["Milan", "Bergamo"] },
        { name: "Tuscany", cities: ["Florence", "Siena"] },
      ],
    },
    Netherlands: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "North Holland", cities: ["Amsterdam", "Haarlem"] },
        { name: "South Holland", cities: ["Rotterdam", "The Hague"] },
        { name: "Utrecht", cities: ["Utrecht"] },
      ],
    },
    Portugal: {
      regionLabel: "District",
      cityLabel: "City",
      regions: [
        { name: "Lisbon District", cities: ["Lisbon", "Cascais"] },
        { name: "Porto District", cities: ["Porto", "Matosinhos"] },
        { name: "Faro District", cities: ["Faro", "Lagos"] },
      ],
    },
    Spain: {
      regionLabel: "Autonomous Community",
      cityLabel: "City",
      regions: [
        { name: "Catalonia", cities: ["Barcelona", "Girona"] },
        { name: "Community of Madrid", cities: ["Madrid"] },
        { name: "Andalusia", cities: ["Seville", "Málaga", "Granada"] },
      ],
    },
    Sweden: {
      regionLabel: "County",
      cityLabel: "City",
      regions: [
        { name: "Stockholm County", cities: ["Stockholm", "Solna"] },
        { name: "Västra Götaland", cities: ["Gothenburg"] },
        { name: "Skåne County", cities: ["Malmö", "Lund"] },
      ],
    },
    "United Kingdom": {
      regionLabel: "Nation / Region",
      cityLabel: "City",
      regions: [
        { name: "England", cities: ["London", "Manchester", "Bristol"] },
        { name: "Scotland", cities: ["Edinburgh", "Glasgow"] },
        { name: "Wales", cities: ["Cardiff"] },
      ],
    },
  },
  "North America": {
    Bahamas: {
      regionLabel: "Island / District",
      cityLabel: "City / Town",
      regions: [
        { name: "New Providence", cities: ["Nassau"] },
        { name: "Grand Bahama", cities: ["Freeport"] },
      ],
    },
    Canada: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Ontario", cities: ["Toronto", "Ottawa", "Mississauga"] },
        { name: "British Columbia", cities: ["Vancouver", "Victoria"] },
        { name: "Quebec", cities: ["Montreal", "Quebec City"] },
        { name: "Alberta", cities: ["Calgary", "Edmonton"] },
      ],
    },
    "Costa Rica": {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "San José", cities: ["San José", "Escazú"] },
        { name: "Guanacaste", cities: ["Liberia", "Tamarindo"] },
        { name: "Puntarenas", cities: ["Puntarenas", "Jacó"] },
      ],
    },
    "Dominican Republic": {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Distrito Nacional", cities: ["Santo Domingo"] },
        { name: "Santiago", cities: ["Santiago de los Caballeros"] },
        { name: "La Altagracia", cities: ["Punta Cana", "Higüey"] },
      ],
    },
    Guatemala: {
      regionLabel: "Department",
      cityLabel: "City",
      regions: [
        { name: "Guatemala", cities: ["Guatemala City"] },
        { name: "Sacatepéquez", cities: ["Antigua Guatemala"] },
        { name: "Quetzaltenango", cities: ["Quetzaltenango"] },
      ],
    },
    Jamaica: {
      regionLabel: "Parish",
      cityLabel: "City / Town",
      regions: [
        { name: "Kingston", cities: ["Kingston"] },
        { name: "Saint James", cities: ["Montego Bay"] },
        { name: "Saint Ann", cities: ["Ocho Rios"] },
      ],
    },
    Mexico: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "Mexico City", cities: ["Mexico City"] },
        { name: "Jalisco", cities: ["Guadalajara", "Puerto Vallarta"] },
        { name: "Nuevo León", cities: ["Monterrey"] },
        { name: "Quintana Roo", cities: ["Cancún", "Tulum"] },
      ],
    },
    Panama: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Panamá", cities: ["Panama City"] },
        { name: "Chiriquí", cities: ["David", "Boquete"] },
        { name: "Colón", cities: ["Colón"] },
      ],
    },
    "United States": {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "California", cities: ["San Diego", "Los Angeles", "San Francisco", "Joshua Tree"] },
        { name: "Texas", cities: ["Austin", "Dallas", "Houston"] },
        { name: "New York", cities: ["New York City", "Buffalo"] },
        { name: "Florida", cities: ["Miami", "Orlando"] },
        { name: "Washington", cities: ["Seattle"] },
        { name: "Oregon", cities: ["Portland"] },
        { name: "Colorado", cities: ["Denver", "Boulder"] },
      ],
    },
  },
  Oceania: {
    Australia: {
      regionLabel: "State / Territory",
      cityLabel: "City",
      regions: [
        { name: "New South Wales", cities: ["Sydney", "Newcastle"] },
        { name: "Victoria", cities: ["Melbourne", "Geelong"] },
        { name: "Queensland", cities: ["Brisbane", "Gold Coast"] },
        { name: "Western Australia", cities: ["Perth"] },
      ],
    },
    Fiji: {
      regionLabel: "Division",
      cityLabel: "City / Town",
      regions: [
        { name: "Central Division", cities: ["Suva", "Nausori"] },
        { name: "Western Division", cities: ["Nadi", "Lautoka"] },
      ],
    },
    "New Zealand": {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Auckland", cities: ["Auckland"] },
        { name: "Wellington", cities: ["Wellington"] },
        { name: "Canterbury", cities: ["Christchurch"] },
      ],
    },
  },
  "South America": {
    Argentina: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Buenos Aires", cities: ["Buenos Aires", "La Plata"] },
        { name: "Córdoba", cities: ["Córdoba"] },
        { name: "Mendoza", cities: ["Mendoza"] },
      ],
    },
    Brazil: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "São Paulo", cities: ["São Paulo", "Campinas"] },
        { name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói"] },
        { name: "Bahia", cities: ["Salvador"] },
      ],
    },
    Chile: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Santiago Metropolitan", cities: ["Santiago"] },
        { name: "Valparaíso", cities: ["Valparaíso", "Viña del Mar"] },
        { name: "Los Lagos", cities: ["Puerto Montt"] },
      ],
    },
    Colombia: {
      regionLabel: "Department",
      cityLabel: "City",
      regions: [
        { name: "Bogotá D.C.", cities: ["Bogotá"] },
        { name: "Antioquia", cities: ["Medellín"] },
        { name: "Valle del Cauca", cities: ["Cali"] },
      ],
    },
    Peru: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Lima", cities: ["Lima"] },
        { name: "Cusco", cities: ["Cusco"] },
        { name: "Arequipa", cities: ["Arequipa"] },
      ],
    },
    Uruguay: {
      regionLabel: "Department",
      cityLabel: "City",
      regions: [
        { name: "Montevideo", cities: ["Montevideo"] },
        { name: "Maldonado", cities: ["Punta del Este"] },
      ],
    },
  },
};

const PLAN_OPTIONS: {
  key: PlanKey;
  title: string;
  price: string;
  subtitle: string;
}[] = [
  {
    key: "starter",
    title: "Starter Plan",
    price: "$1",
    subtitle: "One-time starter access for prototype testing.",
  },
  {
    key: "pro",
    title: "Pro Plan",
    price: "$10/month",
    subtitle: "Monthly plan for extended access and future premium features.",
  },
  {
    key: "skip",
    title: "Skip for Now",
    price: "$0 now",
    subtitle: "Continue through the prototype without entering payment details.",
  },
];

const sharedProjectsSeed: SharedProject[] = [
  {
    id: 1,
    title: "San Diego Family Garden Co-op",
    creator: "Ava Chen",
    category: "Community Living",
    location: "San Diego, California, United States, North America",
    description:
      "A family-friendly garden and skills-sharing group focused on food growing, homeschooling meetups, and weekend build days.",
    tags: ["family", "gardening", "homeschool", "community"],
    profileKeywords: ["family", "garden", "homeschool", "community", "teaching", "kids"],
    thumbnail: "SD",
    lat: 32.7157,
    lng: -117.1611,
    visibility: "public",
  },
  {
    id: 2,
    title: "Joshua Tree Off-Grid Build Camp",
    creator: "Marcus Lee",
    category: "Off-Grid",
    location: "Joshua Tree, California, United States, North America",
    description:
      "A hands-on off-grid project building solar-ready tiny structures, water systems, and a shared maker yard in the desert.",
    tags: ["off-grid", "solar", "building", "tiny home"],
    profileKeywords: ["off-grid", "solar", "build", "land", "construction", "independence"],
    thumbnail: "JT",
    lat: 34.1347,
    lng: -116.3131,
    visibility: "public",
  },
  {
    id: 3,
    title: "Portland Creative Homestead Circle",
    creator: "Lina Patel",
    category: "Creative Community",
    location: "Portland, Oregon, United States, North America",
    description:
      "A small homestead network for artists, gardeners, and families who want shared meals, workshops, and creative studio days.",
    tags: ["art", "homestead", "families", "workshops"],
    profileKeywords: ["creative", "art", "music", "homestead", "community", "family"],
    thumbnail: "PC",
    lat: 45.5152,
    lng: -122.6784,
    visibility: "public",
  },
  {
    id: 4,
    title: "Austin Remote Work + Build Collective",
    creator: "Daniel Ross",
    category: "Hybrid Living",
    location: "Austin, Texas, United States, North America",
    description:
      "A community for people balancing remote work with intentional living, weekend building projects, and shared land planning.",
    tags: ["remote work", "building", "land", "planning"],
    profileKeywords: ["remote", "operations", "tech", "building", "planning", "community"],
    thumbnail: "AT",
    lat: 30.2672,
    lng: -97.7431,
    visibility: "public",
  },
  {
    id: 5,
    title: "Northern Arizona Learning Village",
    creator: "Sofia Alvarez",
    category: "Education",
    location: "Flagstaff, Arizona, United States, North America",
    description:
      "A learning-focused village idea for families who want outdoor education, nature-based routines, and skill-sharing pods.",
    tags: ["education", "nature", "families", "village"],
    profileKeywords: ["education", "family", "village", "nature", "teaching", "kids"],
    thumbnail: "AZ",
    lat: 35.1983,
    lng: -111.6513,
    visibility: "public",
  },
  {
    id: 6,
    title: "Northern California Regenerative Farm Hub",
    creator: "Priya Singh",
    category: "Regenerative Farming",
    location: "San Francisco, California, United States, North America",
    description:
      "A regenerative farm startup looking for growers, builders, and families interested in long-term community life on shared land.",
    tags: ["farming", "regenerative", "land", "families"],
    profileKeywords: ["farm", "land", "family", "off-grid", "growing", "healing"],
    thumbnail: "NC",
    lat: 37.7749,
    lng: -122.4194,
    visibility: "public",
  },
  {
    id: 7,
    title: "Miami Wellness Coastal Hub",
    creator: "Naomi Brooks",
    category: "Creative Community",
    location: "Miami, Florida, United States, North America",
    description:
      "A coastal project focused on wellness retreats, creative residencies, and part-time community living.",
    tags: ["wellness", "coastal", "creative"],
    profileKeywords: ["wellness", "creative", "healing", "community"],
    thumbnail: "MI",
    lat: 25.7617,
    lng: -80.1918,
    visibility: "public",
  },
  {
    id: 8,
    title: "Toronto Urban Garden Network",
    creator: "Eli Turner",
    category: "Community Living",
    location: "Toronto, Ontario, Canada, North America",
    description:
      "A city-based network for shared gardening, family support, and practical local collaboration.",
    tags: ["urban", "garden", "family"],
    profileKeywords: ["garden", "family", "teaching", "community"],
    thumbnail: "TO",
    lat: 43.6532,
    lng: -79.3832,
    visibility: "public",
  },
];

const myProjectCategories = [
  "Community Living",
  "Off-Grid",
  "Creative Community",
  "Hybrid Living",
  "Education",
  "Regenerative Farming",
  "General",
] as const;

const navItems: { key: Exclude<PageKey, "questionnaire" | "project_detail">; label: string; icon: LucideIcon }[] = [
  { key: "home", label: "Home", icon: House },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "account_info", label: "Account Info", icon: User },
  { key: "answers_summary", label: "Answers Summary", icon: Compass },
];

const categoryOrder = [
  "Status",
  "Location + Timing",
  "Project Preferences",
  "Lifestyle",
  "Work + Finances",
  "Skills + Abilities",
  "Commitment + Fit",
] as const;

function extractStateLikeSegment(location: string): string {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  return parts[1] || "";
}

function normalizeTokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}


function getAdaptiveQuestions(currentLocation: string, answers: Record<string, string>): Question[] {
  const locationLower = currentLocation.toLowerCase();
  const inCalifornia =
    locationLower.includes("california") ||
    locationLower.includes("san diego") ||
    locationLower.includes("los angeles");

  const householdType = answers.household_type || "";
  const projectType = answers.project_type || "community";
  const primaryStrength = answers.primary_strength || "your main strength";
  const timeline = answers.timeline || "sometime soon";

  const shouldAskHouseholdSize = householdType !== "Individual" && householdType !== "Couple";
  const householdSizeLabel = householdType === "Friends / group" ? "How many people are in your group?" : "How many people are in your household?";

  return [
    {
      id: "household_type",
      category: "Status",
      type: "select",
      label: "Which best describes your current household status?",
      options: ["Individual", "Couple", "Family with kids", "Family without kids", "Friends / group"],
    },
    ...(shouldAskHouseholdSize
      ? [
          {
            id: "household_size",
            category: "Status",
            type: "select",
            label: householdSizeLabel,
            options: ["1", "2", "3-4", "5-6", "7+"],
          } as Question,
        ]
      : []),
    {
      id: "timeline",
      category: "Location + Timing",
      type: "select",
      label: "How soon are you realistically hoping to make a move or join a project?",
      options: ["Just researching", "Within 6-12 months", "Within 3-6 months", "Within 1-3 months", "Ready now"],
    },
    {
      id: "distance_preference",
      category: "Location + Timing",
      type: "select",
      label: `How far from ${currentLocation || "your current location"} would you consider going?`,
      options: inCalifornia
        ? ["Stay very local", "Anywhere in California", "Western U.S.", "Anywhere in the U.S.", "Open internationally"]
        : ["Stay very local", "Within my region", "Anywhere in my state", "Anywhere in the U.S.", "Open internationally"],
    },
    {
      id: "project_type",
      category: "Project Preferences",
      type: "select",
      label: "What kind of project are you most drawn to right now?",
      options: ["Off-grid build", "Family community", "Creative homestead", "Regenerative farm", "Remote-work community", "Education village"],
    },
    {
      id: "climate_preference",
      category: "Project Preferences",
      type: "select",
      label: `Based on being in ${currentLocation || "your location"}, what climate or environment feels best for you?`,
      options: inCalifornia
        ? ["Coastal / mild", "Mountain / forest", "Desert / dry", "Rural farmland", "No strong preference"]
        : ["Warm / sunny", "Cool / forested", "Dry / desert", "Rural farmland", "No strong preference"],
    },
    {
      id: "community_style",
      category: "Lifestyle",
      type: "select",
      label: "How much community interaction do you want in daily life?",
      options: ["Mostly private", "Small circle", "Balanced mix", "Highly communal", "Flexible / depends on project"],
    },
    {
      id: "housing_style",
      category: "Lifestyle",
      type: "select",
      label: `For a ${projectType.toLowerCase()} setup, what housing style feels like the best fit?`,
      options: ["Private house", "Cabin / tiny home", "Shared land with separate homes", "Intentional shared housing", "Still exploring"],
    },
    {
      id: "work_style",
      category: "Work + Finances",
      type: "select",
      label: "What best describes your current work or income style?",
      options: ["Remote work", "Local job / business", "Self-employed", "Homemaker / caretaker", "Mixed / transitioning"],
    },
    {
      id: "budget_status",
      category: "Work + Finances",
      type: "select",
      label: "What is your current financial readiness for joining or building something?",
      options: ["Very limited right now", "Modest budget", "Can contribute steadily", "Can invest meaningfully", "Need flexible arrangements"],
    },
    {
      id: "build_readiness",
      category: "Skills + Abilities",
      type: "select",
      label: "How ready are you for physical building, setup, or hands-on project work?",
      options: ["Prefer non-physical roles", "Can help lightly", "Can help regularly", "Strong hands-on contributor", "Depends on the project"],
    },
    {
      id: "family_fit",
      category: "Lifestyle",
      type: "select",
      label: householdType.toLowerCase().includes("family")
        ? "What kind of child and family support matters most to you?"
        : "How important is it that the project be family-friendly or child-compatible?",
      options: ["Very important", "Helpful but not essential", "Neutral", "Only if the fit is right", "Not important"],
    },
    {
      id: "food_lifestyle",
      category: "Project Preferences",
      type: "select",
      label: "Which lifestyle element matters most in the project’s daily culture?",
      options: ["Gardening / food growing", "Health / wellness", "Learning / education", "Creativity / arts", "Building / making"],
    },
    {
      id: "accessibility_needs",
      category: "Status",
      type: "select",
      label: "What best describes your accessibility, health, or energy considerations right now?",
      options: ["No major constraints", "Need moderate flexibility", "Need strong accessibility support", "Need lower-physical-intensity roles", "Prefer not to say"],
    },
    {
      id: "primary_strength",
      category: "Skills + Abilities",
      type: "select",
      label: "What is your strongest contribution to a community or project?",
      options: ["Teaching / mentoring", "Building / construction", "Gardening / farming", "Operations / organizing", "Creative / arts", "Wellness / care"],
    },
    {
      id: "secondary_strength",
      category: "Skills + Abilities",
      type: "select",
      label: `What is your second-strongest contribution alongside ${primaryStrength.toLowerCase()}?`,
      options: ["Teaching / mentoring", "Building / construction", "Gardening / farming", "Operations / organizing", "Creative / arts", "Wellness / care"],
    },
    {
      id: "role_preference",
      category: "Commitment + Fit",
      type: "select",
      label: "What role do you naturally want in a community?",
      options: ["Leader / initiator", "Reliable builder", "Organizer / systems person", "Caregiver / support role", "Explorer / still figuring it out"],
    },
    {
      id: "deal_breakers",
      category: "Commitment + Fit",
      type: "textarea",
      label: `What are your biggest deal-breakers for a ${projectType.toLowerCase()} project?`,
      placeholder: "For example: too isolated, too crowded, not enough privacy, bad school fit, unclear ownership...",
    },
    {
      id: "relocation_readiness",
      category: "Location + Timing",
      type: "select",
      label: `Given your timeline of ${timeline.toLowerCase()}, how ready are you for real-world relocation steps?`,
      options: ["Not ready yet", "Collecting information", "Can start planning soon", "Actively preparing", "Already taking action"],
    },
    {
      id: "success_definition",
      category: "Commitment + Fit",
      type: "textarea",
      label: "What would success look like for you one year after joining the right project?",
      placeholder: "Describe the life, rhythm, environment, and sense of belonging you want.",
    },
  ];
}

function ThemeButton({ children, active, onClick, themeStyles, className = "", type = "button" }: { children: ReactNode; active?: boolean; onClick?: () => void; themeStyles: ThemeStyles; className?: string; type?: "button" | "submit"; }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-95 ${className}`}
      style={{ backgroundColor: active ? themeStyles.primary : themeStyles.card, color: active ? themeStyles.primaryText : themeStyles.text, borderColor: active ? themeStyles.primary : themeStyles.border }}
    >
      {children}
    </button>
  );
}

function ThemeInput({ value, onChange, placeholder, themeStyles, multiline = false }: { value: string; onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; placeholder?: string; themeStyles: ThemeStyles; multiline?: boolean; }) {
  const sharedProps = {
    value,
    onChange,
    placeholder,
    className: "w-full rounded-2xl border px-4 py-3 text-sm outline-none placeholder:text-slate-400",
    style: { backgroundColor: themeStyles.panel, color: themeStyles.text, borderColor: themeStyles.border },
  };
  if (multiline) return <textarea rows={4} {...sharedProps} />;
  return <input {...sharedProps} />;
}

function InfoCard({ children, themeStyles, className = "" }: { children: ReactNode; themeStyles: ThemeStyles; className?: string; }) {
  return (
    <div className={`rounded-3xl border ${className}`} style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border, boxShadow: themeStyles.shadow }}>
      {children}
    </div>
  );
}

function ThemeSelect({ value, onChange, options, placeholder, themeStyles }: { value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; options: string[]; placeholder: string; themeStyles: ThemeStyles; }) {
  return (
    <select value={value} onChange={onChange} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none" style={{ backgroundColor: themeStyles.panel, color: themeStyles.text, borderColor: themeStyles.border }}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function createMarkerIcon(L: LeafletModule, themeStyles: ThemeStyles, project: SharedProject, highlighted: boolean, selected: boolean, compact: boolean) {
  const background = highlighted ? "#f59e0b" : project.score ? themeStyles.primary : "#fb7185";
  const size = compact ? 18 : 20;
  const ring = selected ? `0 0 0 4px ${themeStyles.primary}` : highlighted ? "0 0 0 4px rgba(245, 158, 11, 0.35)" : "none";

  return L.divIcon({
    className: "",
    html: `<div class="project-marker ${project.score ? "recommended" : ""} ${highlighted ? "highlighted" : ""}" style="width:${size}px;height:${size}px;background:${background};box-shadow:${ring};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapView({ mode, projects, highlightedIds, activeProjectId, onSelectProject, onOpenFullscreen, themeStyles }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  useEffect(() => {
    let mounted = true;

    async function setupMap() {
      if (!containerRef.current) return;
      const L = await import("leaflet");
      if (!mounted || !containerRef.current) return;
      leafletRef.current = L;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          zoomControl: mode === "full",
          attributionControl: true,
          dragging: mode === "full",
          scrollWheelZoom: mode === "full",
          doubleClickZoom: mode === "full",
          boxZoom: mode === "full",
          keyboard: mode === "full",
          touchZoom: mode === "full",
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapRef.current);

        markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const map = mapRef.current;
      markersLayerRef.current.clearLayers();

      const markerBounds: [number, number][] = [];

      projects.forEach((project) => {
        const highlighted = highlightedIds.includes(project.id);
        const marker = L.marker([project.lat, project.lng], {
          icon: createMarkerIcon(L, themeStyles, project, highlighted, activeProjectId === project.id, mode === "mini"),
        });

        markerBounds.push([project.lat, project.lng]);

        if (mode === "full" && onSelectProject) {
          marker.on("click", () => {
            onSelectProject(project);
          });
        }

        markersLayerRef.current.addLayer(marker);
      });

      if (markerBounds.length > 0) {
        if (mode === "full" && highlightedIds.length > 0) {
          const highlightedProjects = projects.filter((project) => highlightedIds.includes(project.id));
          const focus = highlightedProjects[0];
          if (focus) {
            map.setView([focus.lat, focus.lng], 7, { animate: true });
            return;
          }
        }

        if (markerBounds.length === 1) {
          map.setView(markerBounds[0], mode === "full" ? 7 : 6, { animate: false });
        } else {
          map.fitBounds(markerBounds, { padding: [mode === "full" ? 60 : 30, mode === "full" ? 60 : 30] });
        }
      } else {
        map.setView([39.5, -98.35], 4, { animate: false });
      }
    }

    void setupMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [projects, highlightedIds, activeProjectId, mode, onSelectProject, themeStyles]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[24px]">
      <div ref={containerRef} className="h-full w-full" />
      {mode === "mini" && (
        <button
          onClick={onOpenFullscreen}
          className="absolute inset-0 z-[500] flex items-start justify-end bg-transparent p-3"
          aria-label="Open fullscreen map"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.92)", borderColor: themeStyles.border, color: themeStyles.text }}
          >
            <Expand className="h-3.5 w-3.5" /> Open fullscreen map
          </span>
        </button>
      )}
    </div>
  );
}

export default function Prototype5() {
  const [appStage, setAppStage] = useState<AppStage>("signin_details");
  const [page, setPage] = useState<PageKey>("home");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<number[]>([1, 2]);
  const [recentActivity, setRecentActivity] = useState<string[]>([
    "Opened Prototype 5",
    "Viewed project map",
    "Saved Joshua Tree Off-Grid Build Camp",
  ]);
  const [projectsTab, setProjectsTab] = useState<ProjectsTab>("projects");
  const [fullscreenMapOpen, setFullscreenMapOpen] = useState(false);
  const [activeMapProject, setActiveMapProject] = useState<SharedProject | null>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [selectedPlan, setSelectedPlan] = useState<PlanKey | "">("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});
  const [questionnaireStep, setQuestionnaireStep] = useState(0);

  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectCategory, setProjectCategory] = useState<(typeof myProjectCategories)[number]>("Community Living");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTags, setProjectTags] = useState("");
  const [projectVisibility, setProjectVisibility] = useState<"private" | "public">("private");

  const isDark = theme === "dark";

  const themeStyles: ThemeStyles = isDark
    ? {
        appBg: "#0b1220",
        panel: "#0f172a",
        card: "#111c34",
        border: "#24324b",
        text: "#e5eefc",
        muted: "#9cb0cf",
        primary: "#7aa2ff",
        primaryText: "#08111f",
        pill: "#15233f",
        shadow: "0 18px 40px rgba(0,0,0,0.35)",
      }
    : {
        appBg: "#f4f7fb",
        panel: "#ffffff",
        card: "#ffffff",
        border: "#dbe4f0",
        text: "#0f172a",
        muted: "#5b6b82",
        primary: "#5b8cff",
        primaryText: "#ffffff",
        pill: "#eef4ff",
        shadow: "0 18px 40px rgba(15,23,42,0.08)",
      };

  const shellTextClass = isDark ? "text-slate-100" : "text-slate-900";
  const mutedTextClass = isDark ? "text-slate-300" : "text-slate-600";
  const placeholderClass = isDark ? "placeholder:text-slate-500" : "placeholder:text-slate-400";

  const countriesForSelectedContinent = useMemo(() => {
    if (!selectedContinent || !LOCATION_DATA[selectedContinent]) return [];
    return Object.keys(LOCATION_DATA[selectedContinent]).sort();
  }, [selectedContinent]);

  const selectedCountryData = useMemo<CountryData | null>(() => {
    if (!selectedContinent || !selectedCountry) return null;
    return LOCATION_DATA[selectedContinent]?.[selectedCountry] ?? null;
  }, [selectedContinent, selectedCountry]);

  const regionsForSelectedCountry = useMemo(() => {
    if (!selectedCountryData) return [];
    return selectedCountryData.regions.map((region) => region.name);
  }, [selectedCountryData]);

  const selectedRegionData = useMemo<RegionData | null>(() => {
    if (!selectedCountryData || !selectedRegion) return null;
    return selectedCountryData.regions.find((region) => region.name === selectedRegion) ?? null;
  }, [selectedCountryData, selectedRegion]);

  const citiesForSelectedRegion = useMemo(() => {
    if (!selectedRegionData) return [];
    return selectedRegionData.cities;
  }, [selectedRegionData]);

  const regionLabel = selectedCountryData?.regionLabel || "State / Province / Region";
  const cityLabel = selectedCountryData?.cityLabel || "City";

  const currentLocation = useMemo(() => {
    if (!selectedCity || !selectedRegion || !selectedCountry || !selectedContinent) return "";
    return `${selectedCity}, ${selectedRegion}, ${selectedCountry}, ${selectedContinent}`;
  }, [selectedCity, selectedRegion, selectedCountry, selectedContinent]);

  const userState = useMemo(() => extractStateLikeSegment(currentLocation), [currentLocation]);

  const signInDetailsReady =
    email.trim() !== "" &&
    phone.trim() !== "" &&
    selectedContinent !== "" &&
    selectedCountry !== "" &&
    selectedRegion !== "" &&
    selectedCity !== "";

  const signInPaymentReady = selectedPlan !== "";

  const planLabel = useMemo(() => {
    if (selectedPlan === "starter") return "Starter Plan — $1";
    if (selectedPlan === "pro") return "Pro Plan — $10/month";
    if (selectedPlan === "skip") return "Skip for Now — prototype access";
    return "No plan selected";
  }, [selectedPlan]);

  const adaptiveQuestions = useMemo<Question[]>(() => getAdaptiveQuestions(currentLocation, questionnaireAnswers), [currentLocation, questionnaireAnswers]);
  const currentQuestion = adaptiveQuestions[questionnaireStep] ?? adaptiveQuestions[0];

  const answeredCount = adaptiveQuestions.filter((question) => String(questionnaireAnswers[question.id] || "").trim().length > 0).length;
  const questionnaireComplete = answeredCount === adaptiveQuestions.length;
  const questionnaireProgressPercent = Math.round((answeredCount / adaptiveQuestions.length) * 100);

  const initials = useMemo(() => (email ? email.slice(0, 2).toUpperCase() : "U"), [email]);

  const favoriteProjects = useMemo(() => sharedProjectsSeed.filter((project) => favoriteProjectIds.includes(project.id)), [favoriteProjectIds]);

  const groupedSummary = useMemo<Record<string, { id: string; label: string; value: string }[]>>(() => {
    const summary: Record<string, { id: string; label: string; value: string }[]> = {};

    adaptiveQuestions.forEach((question) => {
      if (!summary[question.category]) summary[question.category] = [];
      summary[question.category].push({
        id: question.id,
        label: question.label,
        value: questionnaireAnswers[question.id] || "Not answered yet",
      });
    });

    const hasHouseholdSize = (summary.Status || []).some((item) => item.id === "household_size");
    if (questionnaireAnswers.household_size && !hasHouseholdSize) {
      if (!summary.Status) summary.Status = [];
      summary.Status.splice(1, 0, {
        id: "household_size",
        label: "Household size",
        value: questionnaireAnswers.household_size,
      });
    }

    return summary;
  }, [adaptiveQuestions, questionnaireAnswers]);

  const recommendedProjects = useMemo<SharedProject[]>(() => {
    if (!questionnaireComplete) return [];

    const tokenSource = [currentLocation, ...Object.values(questionnaireAnswers)].join(" ");
    const tokens = normalizeTokens(tokenSource);

    return sharedProjectsSeed
      .map((project) => {
        const blob = [project.location, project.category, project.description, ...project.tags, ...project.profileKeywords].join(" ").toLowerCase();
        let score = 0;
        const reasons: string[] = [];

        tokens.forEach((token) => {
          if (token.length > 2 && blob.includes(token)) score += 1;
        });

        const locationTokens = normalizeTokens(currentLocation);
        const locationHit = locationTokens.find((token) => project.location.toLowerCase().includes(token));
        if (locationHit) {
          score += 3;
          reasons.push(`Location fit: ${locationHit}`);
        }

        const projectType = String(questionnaireAnswers.project_type || "").toLowerCase();
        if (projectType && blob.includes(projectType.split(" ")[0])) {
          score += 3;
          reasons.push(`Project type fit: ${questionnaireAnswers.project_type}`);
        }

        const strength = String(questionnaireAnswers.primary_strength || "").toLowerCase();
        if (strength && blob.includes(strength.split(" ")[0])) {
          score += 2;
          reasons.push(`Matches your strength: ${questionnaireAnswers.primary_strength}`);
        }

        const lifestyle = String(questionnaireAnswers.food_lifestyle || "").toLowerCase();
        if (lifestyle && blob.includes(lifestyle.split(" ")[0])) {
          score += 2;
          reasons.push(`Lifestyle fit: ${questionnaireAnswers.food_lifestyle}`);
        }

        return {
          ...project,
          score,
          reasons: reasons.slice(0, 3),
        };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 4);
  }, [currentLocation, questionnaireAnswers, questionnaireComplete]);

  const nearbyProjects = useMemo(() => {
    if (!userState) return [];
    return sharedProjectsSeed.filter((project) => extractStateLikeSegment(project.location) === userState);
  }, [userState]);

  const projectsPageSearchResults = useMemo(() => {
    const query = projectSearchQuery.trim().toLowerCase();
    if (!query) return sharedProjectsSeed;
    return sharedProjectsSeed.filter((project) => {
      const blob = [project.title, project.creator, project.category, project.location, project.description, ...project.tags].join(" ").toLowerCase();
      return blob.includes(query);
    });
  }, [projectSearchQuery]);

  const projectsPageHighlightedIds = useMemo(() => projectsPageSearchResults.map((project) => project.id), [projectsPageSearchResults]);

  const miniMapProjects = useMemo(() => {
    const merged = [...recommendedProjects, ...nearbyProjects];
    const byId = new Map<number, SharedProject>();
    merged.forEach((project) => byId.set(project.id, project));
    const values = [...byId.values()];
    return values.length > 0 ? values : sharedProjectsSeed.slice(0, 4);
  }, [recommendedProjects, nearbyProjects]);

  const overviewCount = sharedProjectsSeed.length + userProjects.length;

  const addActivity = (entry: string) => setRecentActivity((prev) => [entry, ...prev].slice(0, 8));

  const toggleFavorite = (projectId: number, title: string) => {
    setFavoriteProjectIds((prev) => {
      const exists = prev.includes(projectId);
      addActivity(exists ? `Removed ${title} from favorites` : `Saved ${title} to favorites`);
      return exists ? prev.filter((id) => id !== projectId) : [projectId, ...prev];
    });
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setPage("project_detail");
    addActivity(`Viewed ${project.title}`);
    setFullscreenMapOpen(false);
  };

  const updateAnswer = (questionId: string, value: string) => {
    setQuestionnaireAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      if (questionId === "household_type") {
        if (value === "Individual") next.household_size = "1";
        else if (value === "Couple") next.household_size = "2";
        else delete next.household_size;
      }
      return next;
    });
  };

  const createProject = () => {
    if (!projectTitle.trim() || !projectLocation.trim() || !projectDescription.trim()) return;

    const newProject: UserProject = {
      id: Date.now(),
      title: projectTitle.trim(),
      location: projectLocation.trim(),
      category: projectCategory,
      description: projectDescription.trim(),
      tags: projectTags.split(",").map((tag) => tag.trim()).filter(Boolean),
      visibility: projectVisibility,
      creator: email || "You",
    };

    setUserProjects((prev) => [newProject, ...prev]);
    addActivity(`Created ${newProject.title}`);
    setProjectTitle("");
    setProjectLocation("");
    setProjectCategory("Community Living");
    setProjectDescription("");
    setProjectTags("");
    setProjectVisibility("private");
    setShowCreateForm(false);
    setProjectsTab("my_projects");
  };

  const handleContinentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedContinent(e.target.value);
    setSelectedCountry("");
    setSelectedRegion("");
    setSelectedCity("");
  };

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setSelectedRegion("");
    setSelectedCity("");
  };

  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setSelectedCity("");
  };

  const filteredHomeProjects = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return sharedProjectsSeed.slice(0, 4);
    return sharedProjectsSeed.filter((project) => {
      const blob = [project.title, project.category, project.location, project.description, ...project.tags].join(" ").toLowerCase();
      return blob.includes(q);
    });
  }, [globalSearchQuery]);

  const ProjectCard = ({ project, compact = false }: { project: Project; compact?: boolean }) => {
    const isFavorite = favoriteProjectIds.includes(project.id);
    return (
      <button onClick={() => openProjectDetail(project)} className="w-full text-left transition hover:-translate-y-0.5">
        <InfoCard themeStyles={themeStyles} className="h-full p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold"
                style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.text }}
              >
                {project.thumbnail || project.title.slice(0, 2).toUpperCase()}
              </div>
              <div
                className="inline-flex rounded-full border px-2.5 py-1 text-xs"
                style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}
              >
                {project.category}
              </div>
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation();
                toggleFavorite(project.id, project.title);
              }}
              className="rounded-full border p-2"
              style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border, color: themeStyles.text }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <div className={`mt-2 flex items-center gap-2 text-sm ${mutedTextClass}`}>
            <MapPin className="h-4 w-4" />
            <span>{project.location}</span>
          </div>
          <p className={`mt-3 text-sm leading-6 ${mutedTextClass}`}>
            {compact ? `${project.description.slice(0, 115)}${project.description.length > 115 ? "..." : ""}` : project.description}
          </p>
          {"reasons" in project && project.reasons && project.reasons.length > 0 && (
            <div className={`mt-3 rounded-2xl border p-3 text-xs ${mutedTextClass}`} style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
              {project.reasons.map((reason) => (
                <div key={reason}>• {reason}</div>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
                style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.text }}
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </InfoCard>
      </button>
    );
  };

  if (appStage === "signin_details") {
    return (
      <div className={`min-h-screen ${shellTextClass}`} style={{ backgroundColor: themeStyles.appBg }}>
        <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-6 py-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border px-4 py-1.5 text-sm" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}>
              Prototype 5
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-tight">Step 1: account details.</h1>
              <p className={`max-w-xl text-lg leading-8 ${mutedTextClass}`}>
                Enter your email, phone number, and location first. Payment and plan selection happen in the next step.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Step 1", text: "Enter email, phone, and filtered location.", icon: User },
                { title: "Step 2", text: "Choose a plan and optionally enter payment info.", icon: CreditCard },
                { title: "Step 3", text: "Enter the app and open the new project map.", icon: MapPin },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <InfoCard key={item.title} themeStyles={themeStyles} className="p-5">
                    <Icon className="mb-4 h-5 w-5" />
                    <p className="font-semibold">{item.title}</p>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>{item.text}</p>
                  </InfoCard>
                );
              })}
            </div>
          </div>

          <InfoCard themeStyles={themeStyles} className="p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold">Required account details</h2>
                <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                  Choose your location in order: continent, country, {regionLabel.toLowerCase()}, then {cityLabel.toLowerCase()}.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Email address</label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-3.5 h-4 w-4 ${mutedTextClass}`} />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none ${placeholderClass}`}
                      style={{ backgroundColor: themeStyles.panel, color: themeStyles.text, borderColor: themeStyles.border }}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Phone number</label>
                  <div className="relative">
                    <Phone className={`absolute left-4 top-3.5 h-4 w-4 ${mutedTextClass}`} />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none ${placeholderClass}`}
                      style={{ backgroundColor: themeStyles.panel, color: themeStyles.text, borderColor: themeStyles.border }}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Continent</label>
                  <ThemeSelect value={selectedContinent} onChange={handleContinentChange} options={Object.keys(LOCATION_DATA)} placeholder="Select continent" themeStyles={themeStyles} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Country</label>
                  <ThemeSelect value={selectedCountry} onChange={handleCountryChange} options={countriesForSelectedContinent} placeholder={selectedContinent ? "Select country" : "Select continent first"} themeStyles={themeStyles} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">{regionLabel}</label>
                  <ThemeSelect value={selectedRegion} onChange={handleRegionChange} options={regionsForSelectedCountry} placeholder={selectedCountry ? `Select ${regionLabel.toLowerCase()}` : "Select country first"} themeStyles={themeStyles} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">{cityLabel}</label>
                  <ThemeSelect value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} options={citiesForSelectedRegion} placeholder={selectedRegion ? `Select ${cityLabel.toLowerCase()}` : `Select ${regionLabel.toLowerCase()} first`} themeStyles={themeStyles} />
                </div>
                {currentLocation && (
                  <div className="rounded-2xl border p-4 text-sm" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.text }}>
                    <p className="font-medium">Saved location preview</p>
                    <p className={`mt-2 ${mutedTextClass}`}>{currentLocation}</p>
                  </div>
                )}
              </div>
              <ThemeButton themeStyles={themeStyles} active onClick={() => signInDetailsReady && setAppStage("signin_payment")} className="w-full justify-center py-3">
                Continue to payment and plan
              </ThemeButton>
            </div>
          </InfoCard>
        </div>
      </div>
    );
  }

  if (appStage === "signin_payment") {
    return (
      <div className={`min-h-screen ${shellTextClass}`} style={{ backgroundColor: themeStyles.appBg }}>
        <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-6 py-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border px-4 py-1.5 text-sm" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}>
              Prototype checkout step
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-tight">Step 2: plan and payment.</h1>
              <p className={`max-w-xl text-lg leading-8 ${mutedTextClass}`}>
                Choose a plan, optionally enter card details, and continue. This is still a prototype, so no real charge is being processed.
              </p>
            </div>
            <InfoCard themeStyles={themeStyles} className="p-5">
              <h3 className="text-lg font-semibold">Prototype note</h3>
              <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                This payment experience is only simulated for prototype testing. You can choose a plan and continue even if you leave the card fields empty.
              </p>
            </InfoCard>
          </div>
          <InfoCard themeStyles={themeStyles} className="p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold">Select plan and payment</h2>
                <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Pick a plan first. For now, every option remains skippable because this is still a prototype.</p>
              </div>
              <div className="grid gap-4">
                {PLAN_OPTIONS.map((plan) => {
                  const active = selectedPlan === plan.key;
                  return (
                    <button
                      key={plan.key}
                      onClick={() => setSelectedPlan(plan.key)}
                      className="rounded-3xl border p-5 text-left transition"
                      style={{ backgroundColor: active ? themeStyles.primary : themeStyles.card, color: active ? themeStyles.primaryText : themeStyles.text, borderColor: active ? themeStyles.primary : themeStyles.border }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">{plan.title}</p>
                          <p className={`mt-2 text-sm leading-6 ${active ? "text-inherit" : mutedTextClass}`}>{plan.subtitle}</p>
                        </div>
                        <span className="text-lg font-semibold">{plan.price}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-3xl border p-5" style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border }}>
                <div className="mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4" /><p className="font-medium">Card details</p></div>
                <div className="grid gap-4">
                  <ThemeInput value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card" themeStyles={themeStyles} />
                  <ThemeInput value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Card number" themeStyles={themeStyles} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <ThemeInput value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" themeStyles={themeStyles} />
                    <ThemeInput value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="CVC" themeStyles={themeStyles} />
                  </div>
                  <ThemeInput value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Billing address" themeStyles={themeStyles} multiline />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ThemeButton themeStyles={themeStyles} onClick={() => setAppStage("signin_details")}>Back</ThemeButton>
                <ThemeButton themeStyles={themeStyles} onClick={() => { setSelectedPlan("skip"); setAppStage("signin_confirmation"); }}>Skip for now</ThemeButton>
                <ThemeButton themeStyles={themeStyles} active onClick={() => signInPaymentReady && setAppStage("signin_confirmation")}>Continue to confirmation</ThemeButton>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    );
  }

  if (appStage === "signin_confirmation") {
    return (
      <div className={`min-h-screen ${shellTextClass}`} style={{ backgroundColor: themeStyles.appBg }}>
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
          <InfoCard themeStyles={themeStyles} className="w-full p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: themeStyles.primary, color: themeStyles.primaryText }}>
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-semibold">You’re all set.</h1>
            <p className={`mx-auto mt-3 max-w-2xl text-sm leading-7 ${mutedTextClass}`}>
              Your account details were saved for the prototype. Selected plan: <strong>{planLabel}</strong>. No real payment is being processed yet.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border p-4 text-left" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                <p className="font-medium">Location</p>
                <p className={`mt-2 text-sm ${mutedTextClass}`}>{currentLocation || "No location saved"}</p>
              </div>
              <div className="rounded-2xl border p-4 text-left" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                <p className="font-medium">Billing status</p>
                <p className={`mt-2 text-sm ${mutedTextClass}`}>{selectedPlan === "skip" ? "Skipped for now" : billingAddress || cardNumber ? "Payment details entered" : "Plan selected without card details"}</p>
              </div>
            </div>
            <div className="mt-8 flex justify-center gap-3">
              <ThemeButton themeStyles={themeStyles} onClick={() => setAppStage("signin_payment")}>Back</ThemeButton>
              <ThemeButton themeStyles={themeStyles} active onClick={() => { addActivity("Entered Prototype 5"); setAppStage("app"); setPage("home"); }}>Go to Home</ThemeButton>
            </div>
          </InfoCard>
        </div>
      </div>
    );
  }

  if (page === "questionnaire") {
    const question = currentQuestion;
    const currentValue = questionnaireAnswers[question.id] || "";

    return (
      <div className={`min-h-screen ${shellTextClass}`} style={{ backgroundColor: themeStyles.appBg }}>
        <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-10">
          <InfoCard themeStyles={themeStyles} className="w-full p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-full border px-4 py-1.5 text-sm" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}>Account questionnaire</div>
                <h1 className="text-3xl font-semibold">Question {questionnaireStep + 1} of {adaptiveQuestions.length}</h1>
                <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Adaptive one-at-a-time flow based on your previous answers and your location: {currentLocation || "not set yet"}.</p>
              </div>
              <ThemeButton themeStyles={themeStyles} onClick={() => setPage("account_info")}>Save and exit</ThemeButton>
            </div>
            <div className="mb-6 h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: themeStyles.pill }}>
              <div className="h-full rounded-full" style={{ width: `${Math.max(5, ((questionnaireStep + 1) / adaptiveQuestions.length) * 100)}%`, backgroundColor: themeStyles.primary }} />
            </div>
            <div className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: themeStyles.muted }}>{question.category}</div>
            <h2 className="text-2xl font-semibold">{question.label}</h2>
            <div className="mt-6">
              {question.type === "select" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {(question.options || []).map((option) => {
                    const active = currentValue === option;
                    return (
                      <button key={option} onClick={() => updateAnswer(question.id, option)} className="rounded-2xl border px-4 py-4 text-left text-sm font-medium transition" style={{ backgroundColor: active ? themeStyles.primary : themeStyles.panel, color: active ? themeStyles.primaryText : themeStyles.text, borderColor: active ? themeStyles.primary : themeStyles.border }}>
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <ThemeInput value={currentValue} onChange={(e) => updateAnswer(question.id, e.target.value)} placeholder={question.placeholder || "Type your answer"} themeStyles={themeStyles} multiline />
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <ThemeButton themeStyles={themeStyles} onClick={() => setQuestionnaireStep((prev) => Math.max(0, prev - 1))} className="min-w-[120px]">Back</ThemeButton>
              <div className={`text-sm ${mutedTextClass}`}>{answeredCount} of {adaptiveQuestions.length} answered</div>
              {questionnaireStep < adaptiveQuestions.length - 1 ? (
                <ThemeButton themeStyles={themeStyles} active onClick={() => { if (!String(currentValue || "").trim()) return; setQuestionnaireStep((prev) => Math.min(adaptiveQuestions.length - 1, prev + 1)); }} className="min-w-[120px]">Next</ThemeButton>
              ) : (
                <ThemeButton themeStyles={themeStyles} active onClick={() => { if (!String(currentValue || "").trim()) return; addActivity("Completed adaptive questionnaire"); setPage("answers_summary"); }} className="min-w-[170px]">Finish questionnaire</ThemeButton>
              )}
            </div>
          </InfoCard>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${shellTextClass}`} style={{ backgroundColor: themeStyles.appBg }}>
      {fullscreenMapOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "rgba(2, 6, 23, 0.78)" }}>
          <div className="flex items-center justify-between gap-4 border-b px-6 py-4" style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border }}>
            <div>
              <h2 className="text-2xl font-semibold">Full project map</h2>
              <p className={`mt-1 text-sm ${mutedTextClass}`}>All public projects are visible here. Search results stay highlighted.</p>
            </div>
            <ThemeButton themeStyles={themeStyles} onClick={() => setFullscreenMapOpen(false)}>
              <X className="mr-2 inline h-4 w-4" /> Close map
            </ThemeButton>
          </div>
          <div className="grid flex-1 gap-4 p-6 lg:grid-cols-[1.4fr_0.6fr]">
            <InfoCard themeStyles={themeStyles} className="overflow-hidden p-3">
              <div className="h-[70vh] min-h-[520px] w-full">
                <MapView
                  mode="full"
                  projects={sharedProjectsSeed}
                  highlightedIds={projectSearchQuery.trim() ? projectsPageHighlightedIds : []}
                  activeProjectId={activeMapProject?.id ?? null}
                  onSelectProject={(project) => {
                    setActiveMapProject(project);
                    addActivity(`Selected ${project.title} on fullscreen map`);
                  }}
                  themeStyles={themeStyles}
                />
              </div>
            </InfoCard>
            <InfoCard themeStyles={themeStyles} className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Map project preview</h3>
                {projectSearchQuery && (
                  <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: themeStyles.pill, color: themeStyles.text }}>
                    {projectsPageSearchResults.length} match{projectsPageSearchResults.length === 1 ? "" : "es"}
                  </span>
                )}
              </div>
              {activeMapProject ? (
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <div className="inline-flex rounded-full border px-3 py-1 text-xs" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}>{activeMapProject.category}</div>
                    <h4 className="mt-4 text-xl font-semibold">{activeMapProject.title}</h4>
                    <div className={`mt-3 flex items-center gap-2 text-sm ${mutedTextClass}`}><MapPin className="h-4 w-4" /><span>{activeMapProject.location}</span></div>
                    <p className={`mt-4 text-sm leading-7 ${mutedTextClass}`}>{activeMapProject.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeMapProject.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.text }}>
                          <Tag className="h-3 w-3" />{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <ThemeButton themeStyles={themeStyles} active onClick={() => openProjectDetail(activeMapProject)}>
                      See full project details
                    </ThemeButton>
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl border p-4 text-sm leading-7 ${mutedTextClass}`} style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                  Click any pin on the fullscreen map to open its project card here.
                </div>
              )}
            </InfoCard>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r p-5 md:block" style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border }}>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: themeStyles.muted }}>Prototype 5</p>
            <h2 className="mt-2 text-2xl font-semibold">Workspace</h2>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = page === item.key;
              return (
                <button key={item.key} onClick={() => { setPage(item.key); setProfileMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition" style={{ backgroundColor: active ? themeStyles.primary : "transparent", color: active ? themeStyles.primaryText : themeStyles.text, border: `1px solid ${active ? themeStyles.primary : "transparent"}` }}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <InfoCard themeStyles={themeStyles} className="mt-6 p-5">
            <div className="mb-4 flex items-center gap-2"><Clock3 className="h-4 w-4" /><h3 className="font-semibold">Recent activity</h3></div>
            <div className="space-y-3 text-sm" style={{ color: themeStyles.muted }}>
              {recentActivity.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: themeStyles.primary }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </InfoCard>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border p-4 md:flex-row md:items-center md:justify-between" style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border, boxShadow: themeStyles.shadow }}>
            <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border px-4 py-3" style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border }}>
              <Search className="h-4 w-4" style={{ color: themeStyles.muted }} />
              <input
                className={`w-full bg-transparent text-sm outline-none ${placeholderClass}`}
                placeholder={page === "projects" ? "Search projects, categories, locations, or tags" : "Search featured projects"}
                value={page === "projects" ? projectSearchQuery : globalSearchQuery}
                onChange={(e) => page === "projects" ? setProjectSearchQuery(e.target.value) : setGlobalSearchQuery(e.target.value)}
                style={{ color: themeStyles.text }}
              />
            </div>
            <div className="relative flex items-center gap-3 self-end md:self-auto">
              <button className="rounded-full border p-3" style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border, color: themeStyles.text }}><Bell className="h-4 w-4" /></button>
              <button onClick={() => setProfileMenuOpen((prev) => !prev)} className="flex items-center gap-2 rounded-full border px-2 py-1.5" style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border, color: themeStyles.text }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: themeStyles.primary, color: themeStyles.primaryText }}>{initials}</div>
                <ChevronDown className="h-4 w-4" />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-14 z-20 w-60 rounded-3xl border p-2" style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border, boxShadow: themeStyles.shadow }}>
                  {[
                    { label: "Projects", action: () => setPage("projects") },
                    { label: "Favorites", action: () => setPage("favorites") },
                    { label: "Account Info", action: () => setPage("account_info") },
                    { label: "Answers Summary", action: () => setPage("answers_summary") },
                    { label: "Settings", action: () => setPage("settings") },
                  ].map((item) => (
                    <button key={item.label} onClick={() => { item.action(); setProfileMenuOpen(false); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm hover:opacity-90" style={{ color: themeStyles.text }}>{item.label}</button>
                  ))}
                  <div className="my-2 border-t" style={{ borderColor: themeStyles.border }} />
                  <button onClick={() => { setAppStage("signin_details"); setProfileMenuOpen(false); }} className="w-full rounded-2xl px-4 py-3 text-left text-sm" style={{ color: themeStyles.text }}>Sign out</button>
                </div>
              )}
            </div>
          </div>

          {page === "home" && (
            <div className="space-y-6">
              <InfoCard themeStyles={themeStyles} className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="mb-3 inline-flex rounded-full border px-4 py-1.5 text-sm" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}>Prototype 5 overview</div>
                    <h1 className="text-3xl font-semibold">Projects now has tabs and a live map.</h1>
                    <p className={`mt-2 max-w-3xl text-sm leading-7 ${mutedTextClass}`}>
                      Open the Projects page to browse shared community projects, see recommendations, and use the new minimap and fullscreen map experience.
                    </p>
                  </div>
                  <ThemeButton themeStyles={themeStyles} active onClick={() => { setPage("projects"); setProjectsTab("projects"); }}>
                    Open Projects
                  </ThemeButton>
                </div>
              </InfoCard>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Public projects", value: sharedProjectsSeed.length },
                  { label: "My projects", value: userProjects.length },
                  { label: "Saved favorites", value: favoriteProjectIds.length },
                ].map((item) => (
                  <InfoCard key={item.label} themeStyles={themeStyles} className="p-5">
                    <p className={`text-sm ${mutedTextClass}`}>{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                  </InfoCard>
                ))}
              </div>

              <InfoCard themeStyles={themeStyles} className="p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Featured public projects</h2>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>A quick preview from the shared project network.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {filteredHomeProjects.map((project) => <ProjectCard key={project.id} project={project} compact />)}
                </div>
              </InfoCard>
            </div>
          )}

          {page === "projects" && (
            <div className="space-y-6">
              <InfoCard themeStyles={themeStyles} className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold">Projects</h1>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                      Browse shared projects, map recommendations, and manage your own projects in one place.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <ThemeButton themeStyles={themeStyles} active={projectsTab === "projects"} onClick={() => setProjectsTab("projects")}>Projects</ThemeButton>
                    <ThemeButton themeStyles={themeStyles} active={projectsTab === "my_projects"} onClick={() => setProjectsTab("my_projects")}>My Projects</ThemeButton>
                  </div>
                </div>
              </InfoCard>

              {projectsTab === "projects" ? (
                <div className="space-y-6">
                  <InfoCard themeStyles={themeStyles} className="p-6">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">Recommended and nearby project map</h2>
                        <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                          The minimap starts with recommended projects and projects in your same state. Click it to open the fullscreen map with all public project pins.
                        </p>
                      </div>
                      <div className="text-sm" style={{ color: themeStyles.muted }}>
                        {userState ? `Nearby is based on your saved state: ${userState}` : "Save your location to improve nearby matches."}
                      </div>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                      <div>
                        <div className="h-[320px] overflow-hidden rounded-[24px] border" style={{ borderColor: themeStyles.border }}>
                          <MapView
                            mode="mini"
                            projects={miniMapProjects}
                            highlightedIds={projectSearchQuery.trim() ? projectsPageHighlightedIds : []}
                            activeProjectId={activeMapProject?.id ?? null}
                            onOpenFullscreen={() => setFullscreenMapOpen(true)}
                            themeStyles={themeStyles}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-2xl border p-4" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border }}>
                          <p className="font-medium">Map contents</p>
                          <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                            Minimap pins: recommended projects first, plus nearby projects in the same state. Fullscreen map: all public shared projects.
                          </p>
                        </div>
                        <div className="rounded-2xl border p-4" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border }}>
                          <p className="font-medium">Search behavior</p>
                          <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                            Searching filters the shared project list and highlights matching pins on the map.
                          </p>
                        </div>
                        <div className="rounded-2xl border p-4" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border }}>
                          <p className="font-medium">Project total</p>
                          <p className="mt-2 text-3xl font-semibold">{sharedProjectsSeed.length}</p>
                        </div>
                      </div>
                    </div>
                  </InfoCard>

                  {activeMapProject && (
                    <InfoCard themeStyles={themeStyles} className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                          <div className="inline-flex rounded-full border px-3 py-1 text-xs" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}>{activeMapProject.category}</div>
                          <h3 className="mt-3 text-2xl font-semibold">{activeMapProject.title}</h3>
                          <div className={`mt-2 flex items-center gap-2 text-sm ${mutedTextClass}`}><MapPin className="h-4 w-4" /><span>{activeMapProject.location}</span></div>
                          <p className={`mt-3 max-w-3xl text-sm leading-7 ${mutedTextClass}`}>{activeMapProject.description}</p>
                        </div>
                        <ThemeButton themeStyles={themeStyles} active onClick={() => openProjectDetail(activeMapProject)}>
                          See full project details
                        </ThemeButton>
                      </div>
                    </InfoCard>
                  )}

                  <InfoCard themeStyles={themeStyles} className="p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold">Recommended projects</h2>
                        <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>These are only shown on the Projects tab.</p>
                      </div>
                    </div>
                    {questionnaireComplete ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {recommendedProjects.map((project) => <ProjectCard key={project.id} project={project} compact />)}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed p-6" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                        <p className="text-lg font-semibold">No recommendations available.</p>
                        <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Please fill out the questionnaire to unlock recommendations on the Projects tab.</p>
                        <div className="mt-4"><ThemeButton themeStyles={themeStyles} active onClick={() => { setQuestionnaireStep(0); setPage("questionnaire"); }}>Fill out questionnaire</ThemeButton></div>
                      </div>
                    )}
                  </InfoCard>

                  <InfoCard themeStyles={themeStyles} className="p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold">Other projects people made</h2>
                        <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>{projectSearchQuery ? `Showing ${projectsPageSearchResults.length} search result${projectsPageSearchResults.length === 1 ? "" : "s"}.` : "Browse all public shared projects."}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {projectsPageSearchResults.map((project) => <ProjectCard key={project.id} project={project} compact />)}
                    </div>
                  </InfoCard>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-semibold">My Projects</h2>
                      <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Create and manage your own projects here.</p>
                    </div>
                    <ThemeButton themeStyles={themeStyles} active onClick={() => setShowCreateForm((prev) => !prev)}>
                      <Plus className="mr-2 inline h-4 w-4" /> {showCreateForm ? "Close form" : "Create project"}
                    </ThemeButton>
                  </div>
                  {showCreateForm && (
                    <InfoCard themeStyles={themeStyles} className="p-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium">Title</label>
                          <ThemeInput value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Enter project title" themeStyles={themeStyles} />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Location</label>
                          <ThemeInput value={projectLocation} onChange={(e) => setProjectLocation(e.target.value)} placeholder="Enter project location" themeStyles={themeStyles} />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Category</label>
                          <select value={projectCategory} onChange={(e) => setProjectCategory(e.target.value as (typeof myProjectCategories)[number])} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none" style={{ backgroundColor: themeStyles.panel, color: themeStyles.text, borderColor: themeStyles.border }}>
                            {myProjectCategories.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Visibility</label>
                          <select value={projectVisibility} onChange={(e) => setProjectVisibility(e.target.value as "private" | "public")} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none" style={{ backgroundColor: themeStyles.panel, color: themeStyles.text, borderColor: themeStyles.border }}>
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">Description</label>
                          <ThemeInput value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Describe the project" themeStyles={themeStyles} multiline />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">Tags</label>
                          <ThemeInput value={projectTags} onChange={(e) => setProjectTags(e.target.value)} placeholder="Comma-separated tags" themeStyles={themeStyles} />
                        </div>
                      </div>
                      <div className="mt-5"><ThemeButton themeStyles={themeStyles} active onClick={createProject}>Create project</ThemeButton></div>
                    </InfoCard>
                  )}
                  {userProjects.length === 0 ? (
                    <InfoCard themeStyles={themeStyles} className="p-10 text-center">
                      <FolderKanban className="mx-auto h-10 w-10" style={{ color: themeStyles.muted }} />
                      <h3 className="mt-4 text-xl font-semibold">No projects yet</h3>
                      <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Create your first project to start building your workspace.</p>
                    </InfoCard>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {userProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {page === "favorites" && (
            <InfoCard themeStyles={themeStyles} className="p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-semibold">Your favorites</h1>
                  <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Every saved project appears here.</p>
                </div>
                <Heart className="h-6 w-6" style={{ color: themeStyles.primary }} />
              </div>
              {favoriteProjects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {favoriteProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed p-8 text-center text-sm" style={{ borderColor: themeStyles.border, color: themeStyles.muted }}>You have no saved favorites yet.</div>
              )}
            </InfoCard>
          )}

          {page === "project_detail" && selectedProject && (
            <div className="space-y-6">
              <ThemeButton themeStyles={themeStyles} onClick={() => { setPage("projects"); setProjectsTab("projects"); }}>
                <ArrowLeft className="mr-2 inline h-4 w-4" /> Back to Projects
              </ThemeButton>
              <InfoCard themeStyles={themeStyles} className="p-6 md:p-8">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex rounded-full border px-3 py-1 text-xs" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}>{selectedProject.category}</span>
                      <span className="inline-flex rounded-full border px-3 py-1 text-xs" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.muted }}>
                        {selectedProject.visibility === "public" ? <><Globe className="mr-1 inline h-3 w-3" /> Public project</> : <><Lock className="mr-1 inline h-3 w-3" /> Private project</>}
                      </span>
                    </div>
                    <h1 className="text-4xl font-semibold">{selectedProject.title}</h1>
                    <div className={`mt-4 flex items-center gap-2 text-sm ${mutedTextClass}`}><MapPin className="h-4 w-4" /><span>{selectedProject.location}</span></div>
                    <p className={`mt-6 text-base leading-8 ${mutedTextClass}`}>{selectedProject.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs" style={{ backgroundColor: themeStyles.pill, borderColor: themeStyles.border, color: themeStyles.text }}><Tag className="h-3 w-3" />{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <InfoCard themeStyles={themeStyles} className="p-5">
                      <h2 className="text-lg font-semibold">Project summary</h2>
                      <div className={`mt-4 space-y-3 text-sm ${mutedTextClass}`}>
                        <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Created by {selectedProject.creator}</div>
                        <div className="flex items-center gap-2"><Compass className="h-4 w-4" /> Category: {selectedProject.category}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location: {selectedProject.location}</div>
                      </div>
                    </InfoCard>
                    <div className="flex flex-wrap gap-3">
                      <ThemeButton themeStyles={themeStyles} active={favoriteProjectIds.includes(selectedProject.id)} onClick={() => toggleFavorite(selectedProject.id, selectedProject.title)}>
                        <Heart className={`mr-2 inline h-4 w-4 ${favoriteProjectIds.includes(selectedProject.id) ? "fill-current" : ""}`} />
                        {favoriteProjectIds.includes(selectedProject.id) ? "Saved" : "Save to favorites"}
                      </ThemeButton>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>
          )}

          {page === "settings" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <InfoCard themeStyles={themeStyles} className="p-6">
                <h1 className="text-2xl font-semibold">Appearance</h1>
                <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Dark mode updates the full interface consistently.</p>
                <div className="mt-6 flex items-center justify-between rounded-3xl border p-5" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                  <div>
                    <p className="font-semibold">Dark / Light mode</p>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>Choose the theme for the whole app.</p>
                  </div>
                  <ThemeButton themeStyles={themeStyles} active onClick={() => setTheme(isDark ? "light" : "dark")}>
                    {isDark ? <Sun className="mr-2 inline h-4 w-4" /> : <Moon className="mr-2 inline h-4 w-4" />}
                    {isDark ? "Switch to light" : "Switch to dark"}
                  </ThemeButton>
                </div>
              </InfoCard>
              <InfoCard themeStyles={themeStyles} className="p-6">
                <h1 className="text-2xl font-semibold">Notifications</h1>
                <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Decide whether the app should surface alerts and activity updates.</p>
                <div className="mt-6 flex items-center justify-between rounded-3xl border p-5" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                  <div>
                    <p className="font-semibold">Enable notifications</p>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>Project updates, saved items, and activity reminders.</p>
                  </div>
                  <button onClick={() => setNotificationsEnabled((prev) => !prev)} className="rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: notificationsEnabled ? themeStyles.primary : themeStyles.card, color: notificationsEnabled ? themeStyles.primaryText : themeStyles.text, border: `1px solid ${themeStyles.border}` }}>
                    {notificationsEnabled ? "On" : "Off"}
                  </button>
                </div>
              </InfoCard>
            </div>
          )}

          {page === "account_info" && (
            <div className="space-y-6">
              <InfoCard themeStyles={themeStyles} className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold" style={{ backgroundColor: themeStyles.primary, color: themeStyles.primaryText }}>{initials}</div>
                    <div>
                      <h1 className="text-2xl font-semibold">Account Info</h1>
                      <p className={`mt-1 text-sm ${mutedTextClass}`}>Basic account details, plan, billing, and questionnaire progress.</p>
                    </div>
                  </div>
                  <ThemeButton themeStyles={themeStyles} active onClick={() => setPage("questionnaire")}>{questionnaireComplete ? "Edit questionnaire" : "Continue questionnaire"}</ThemeButton>
                </div>
              </InfoCard>
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <InfoCard themeStyles={themeStyles} className="p-6">
                  <h2 className="text-xl font-semibold">Basic account details</h2>
                  <div className="mt-5 space-y-4 text-sm">
                    {[
                      { label: "Email", value: email || "Not provided" },
                      { label: "Phone", value: phone || "Not provided" },
                      { label: "Current location", value: currentLocation || "Not provided" },
                      { label: "Selected plan", value: planLabel },
                      { label: "Billing status", value: selectedPlan === "skip" ? "Skipped for now" : billingAddress || cardNumber ? "Card details entered" : "Plan selected without payment details" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border p-4" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                        <p className="font-medium">{item.label}</p>
                        <p className={`mt-2 leading-6 ${mutedTextClass}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </InfoCard>
                <InfoCard themeStyles={themeStyles} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Questionnaire progress</h2>
                      <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>20 adaptive questions covering status, preferences, abilities, skills, and readiness.</p>
                    </div>
                    <div className="rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: themeStyles.primary, color: themeStyles.primaryText }}>{questionnaireProgressPercent}%</div>
                  </div>
                  <div className="mt-5 h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: themeStyles.pill }}>
                    <div className="h-full rounded-full" style={{ width: `${questionnaireProgressPercent}%`, backgroundColor: themeStyles.primary }} />
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {categoryOrder.map((category) => {
                      const total = adaptiveQuestions.filter((item) => item.category === category).length;
                      const done = adaptiveQuestions.filter((item) => item.category === category && String(questionnaireAnswers[item.id] || "").trim()).length;
                      return (
                        <div key={category} className="rounded-2xl border p-4" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                          <p className="font-medium">{category}</p>
                          <p className={`mt-2 text-sm ${mutedTextClass}`}>{done} of {total} answered</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <ThemeButton themeStyles={themeStyles} active onClick={() => setPage("questionnaire")}>{questionnaireComplete ? "Edit questionnaire" : "Start questionnaire"}</ThemeButton>
                    <ThemeButton themeStyles={themeStyles} onClick={() => setPage("answers_summary")}>View answers summary</ThemeButton>
                  </div>
                </InfoCard>
              </div>
            </div>
          )}

          {page === "answers_summary" && (
            <div className="space-y-6">
              <InfoCard themeStyles={themeStyles} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-semibold">Answers Summary</h1>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>Review the adaptive questionnaire responses and reopen the wizard to edit anything.</p>
                  </div>
                  <ThemeButton themeStyles={themeStyles} active onClick={() => setPage("questionnaire")}><PenSquare className="mr-2 inline h-4 w-4" /> Edit questionnaire</ThemeButton>
                </div>
              </InfoCard>
              {categoryOrder.map((category) => (
                <InfoCard key={category} themeStyles={themeStyles} className="p-6">
                  <h2 className="text-xl font-semibold">{category}</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {(groupedSummary[category] || []).map((item) => (
                      <div key={item.id} className="rounded-2xl border p-4" style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.pill }}>
                        <p className="font-medium">{item.label}</p>
                        <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
