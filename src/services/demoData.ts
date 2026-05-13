import type { Game, PaginatedGamesResponse, Review } from "../types";

const now = "2026-05-13T00:00:00.000Z";

export const demoGames: Game[] = [
  {
    id: 1,
    developerId: 101,
    developerName: "Northline Studio",
    title: "Ember Circuit",
    slug: "ember-circuit",
    shortDescription: "A fast tactical action game about routing power through a city under siege.",
    description:
      "Route power, dodge patrols, and restore districts before the grid collapses. Ember Circuit blends quick action with compact strategy encounters.",
    category: "Action",
    tags: ["Action", "Sci-fi", "Tactics"],
    priceTnd: 29,
    coverImageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
    downloadUrl: "https://example.com/downloads/ember-circuit",
    status: "published",
    averageRating: 4.7,
    reviewCount: 128,
    viewsCount: 8420,
    downloadsCount: 2310,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 2,
    developerId: 102,
    developerName: "Mint Forge",
    title: "Garden of Signals",
    slug: "garden-of-signals",
    shortDescription: "A gentle puzzle adventure where every plant changes the rules of the maze.",
    description:
      "Grow signal flowers, rotate paths, and solve layered puzzles across a living garden that reacts to every move.",
    category: "Puzzle",
    tags: ["Puzzle", "Cozy", "Adventure"],
    priceTnd: 18,
    coverImageUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
    downloadUrl: "https://example.com/downloads/garden-of-signals",
    status: "published",
    averageRating: 4.4,
    reviewCount: 74,
    viewsCount: 5160,
    downloadsCount: 1460,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 3,
    developerId: 103,
    developerName: "Atlas Byte",
    title: "Skywake Caravan",
    slug: "skywake-caravan",
    shortDescription: "Build a flying convoy, trade between islands, and survive shifting storm routes.",
    description:
      "Manage ships, crew, cargo, and fragile alliances in a strategy RPG set across airborne trade routes.",
    category: "Strategy",
    tags: ["Strategy", "RPG", "Management"],
    priceTnd: 36,
    coverImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    downloadUrl: "https://example.com/downloads/skywake-caravan",
    status: "published",
    averageRating: 4.8,
    reviewCount: 91,
    viewsCount: 6290,
    downloadsCount: 1885,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 4,
    developerId: 104,
    developerName: "Lantern Labs",
    title: "Moonwell Archive",
    slug: "moonwell-archive",
    shortDescription: "An exploration RPG about decoding ruins, memories, and lost star maps.",
    description:
      "Explore old observatories, collect fragments of language, and rebuild a history hidden under moonlit stone.",
    category: "RPG",
    tags: ["RPG", "Exploration", "Story"],
    priceTnd: 42,
    coverImageUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    downloadUrl: "https://example.com/downloads/moonwell-archive",
    status: "published",
    averageRating: 4.5,
    reviewCount: 62,
    viewsCount: 4720,
    downloadsCount: 1090,
    createdAt: now,
    updatedAt: now
  }
];

const normalize = (value: string) => value.trim().toLowerCase();

export const getDemoGames = (query: Record<string, string | number | undefined> = {}): PaginatedGamesResponse => {
  const search = normalize(String(query.search ?? ""));
  const category = normalize(String(query.category ?? ""));
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 12);

  const filtered = demoGames.filter((game) => {
    const matchesSearch =
      !search ||
      normalize(game.title).includes(search) ||
      normalize(game.shortDescription).includes(search) ||
      game.tags.some((tag) => normalize(tag).includes(search));
    const matchesCategory = !category || normalize(game.category) === category;
    return matchesSearch && matchesCategory;
  });

  const start = Math.max(page - 1, 0) * limit;

  return {
    games: filtered.slice(start, start + limit),
    meta: {
      total: filtered.length,
      page,
      limit
    }
  };
};

export const getDemoGameById = (id: number | string) => demoGames.find((game) => String(game.id) === String(id));

export const getDemoReviews = (gameId: number | string): Review[] => {
  const game = getDemoGameById(gameId);
  if (!game) return [];

  return [
    {
      id: Number(`${game.id}01`),
      gameId: game.id,
      userId: 201,
      userName: "Amina K.",
      rating: Math.min(5, Math.round(game.averageRating)),
      comment: "Polished, responsive, and easy to recommend.",
      createdAt: now
    },
    {
      id: Number(`${game.id}02`),
      gameId: game.id,
      userId: 202,
      userName: "Youssef B.",
      rating: 4,
      comment: "Great presentation and a strong loop after the first few minutes.",
      createdAt: now
    }
  ];
};
