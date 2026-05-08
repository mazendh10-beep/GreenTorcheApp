export type UserRole = "player" | "developer" | "admin";
export type GameStatus = "draft" | "published";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface Game {
  id: number;
  developerId: number;
  developerName: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  priceTnd: number;
  coverImageUrl: string;
  bannerImageUrl: string;
  downloadUrl: string;
  status: GameStatus;
  averageRating: number;
  reviewCount: number;
  viewsCount: number;
  downloadsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameInput {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  priceTnd: number;
  coverImageUrl: string;
  bannerImageUrl: string;
  downloadUrl: string;
  status: GameStatus;
}

export interface Review {
  id: number;
  gameId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserReview extends Review {
  gameTitle: string;
}

export interface ReviewInput {
  rating: number;
  comment: string;
}

export interface AnalyticsOverview {
  totalUsers: number;
  totalGames: number;
  totalReviews: number;
  totalDownloads: number;
  totalViews: number;
}

export interface DeveloperAnalytics {
  gameId: number;
  gameTitle: string;
  viewsCount: number;
  downloadsCount: number;
  averageRating: number;
}

export interface PaginatedGamesResponse {
  games: Game[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
