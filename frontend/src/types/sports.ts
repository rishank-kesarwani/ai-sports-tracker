export type SportType = 'Soccer' | 'Cricket' | 'Basketball' | 'Tennis';

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export type DataFreshness = 'live' | 'near-real-time' | 'cached';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  preferences?: {
    followedTeams: string[];
    followedLeagues: string[];
    followedPlayers: string[];
    followedSports: string[];
    notificationSettings: {
      matchStarting: boolean;
      matchResult: boolean;
      teamNews: boolean;
      weeklyDigest: boolean;
      channels: string[];
    };
  };
}

export interface Team {
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
  socials?: Record<string, string>;
  stats?: {
    played?: number;
    wins?: number;
    draws?: number;
    losses?: number;
    points?: number;
    form?: string[];
  };
  isFavorite?: boolean;
}

export interface Player {
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

export interface StandingRow {
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
}

export interface League {
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
  standings?: StandingRow[];
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

export interface Match {
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
    subScores?: Array<number | string>;
  };
  awayTeam: {
    id: string;
    name: string;
    badgeUrl?: string;
    score?: number | string;
    subScores?: Array<number | string>;
  };
  startTime: string;
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

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'MATCH_STARTING' | 'MATCH_RESULT' | 'TEAM_UPDATE' | 'PLAYER_UPDATE' | 'WEEKLY_SPORTS_DIGEST';
  channel: 'IN_APP' | 'EMAIL' | 'PUSH';
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface FollowedCategory {
  teams: Array<{ _id: string; itemId: string; itemName: string; itemBadgeUrl?: string; sport?: string }>;
  leagues: Array<{ _id: string; itemId: string; itemName: string; itemBadgeUrl?: string; sport?: string }>;
  players: Array<{ _id: string; itemId: string; itemName: string; itemBadgeUrl?: string; sport?: string }>;
  totalFollows: number;
}
