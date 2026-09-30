export enum SportType {
  SOCCER = 'Soccer',
  CRICKET = 'Cricket',
  BASKETBALL = 'Basketball',
  TENNIS = 'Tennis',
}

export type DataFreshness = 'live' | 'near-real-time' | 'cached';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  HALFTIME = 'HALFTIME',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
}

export interface NormalizedTeam {
  id: string;
  providerId: string;
  name: string;
  shortName?: string;
  sport: SportType | string;
  leagueId?: string;
  leagueName?: string;
  country?: string;
  stadium?: string;
  stadiumCapacity?: number;
  badgeUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  jerseyUrl?: string;
  formedYear?: number;
  description?: string;
  website?: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  stats?: {
    played?: number;
    wins?: number;
    draws?: number;
    losses?: number;
    points?: number;
    form?: string[]; // e.g. ['W', 'W', 'D', 'L', 'W']
  };
  isFavorite?: boolean;
}

export interface NormalizedPlayer {
  id: string;
  providerId: string;
  teamId?: string;
  teamName?: string;
  name: string;
  sport: SportType | string;
  nationality?: string;
  position?: string;
  dateOfBirth?: string;
  height?: string;
  weight?: string;
  thumbUrl?: string;
  cutoutUrl?: string;
  bannerUrl?: string;
  description?: string;
  jerseyNumber?: string;
  stats?: Record<string, any>;
  isFavorite?: boolean;
}

export interface NormalizedLeague {
  id: string;
  providerId: string;
  name: string;
  sport: SportType | string;
  country?: string;
  badgeUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  currentSeason?: string;
  description?: string;
  standings?: Array<{
    rank: number;
    teamId: string;
    teamName: string;
    badgeUrl?: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }>;
  isFavorite?: boolean;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'wicket' | 'boundary' | 'set_point' | 'point';
  team: 'home' | 'away';
  player: string;
  assist?: string;
  detail?: string;
}

export interface NormalizedMatch {
  id: string;
  providerId: string;
  sport: SportType | string;
  leagueId: string;
  leagueName: string;
  season?: string;
  round?: string;
  homeTeam: {
    id: string;
    name: string;
    badgeUrl?: string;
    score?: number | string;
    subScores?: Array<number | string>; // e.g. cricket overs/wickets or tennis sets
  };
  awayTeam: {
    id: string;
    name: string;
    badgeUrl?: string;
    score?: number | string;
    subScores?: Array<number | string>;
  };
  startTime: string; // ISO string
  status: MatchStatus;
  minute?: number | string;
  venue?: string;
  referee?: string;
  spectators?: number;
  events?: MatchEvent[];
  stats?: {
    possession?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    totalShots?: { home: number; away: number };
    fouls?: { home: number; away: number };
    corners?: { home: number; away: number };
  };
  aiSummary?: string;
  lastSyncedAt: string;
  freshness: DataFreshness;
}

export interface UserPreferencesDto {
  followedTeams: string[];
  followedLeagues: string[];
  followedPlayers: string[];
  followedSports: string[];
  notificationSettings: {
    matchStarting: boolean;
    matchResult: boolean;
    teamNews: boolean;
    weeklyDigest: boolean;
    channels: ('EMAIL' | 'PUSH' | 'IN_APP')[];
  };
}
