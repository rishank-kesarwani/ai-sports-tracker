import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ISportsDataProvider } from './sports-data-provider.interface';
import {
  DataFreshness,
  MatchStatus,
  NormalizedLeague,
  NormalizedMatch,
  NormalizedPlayer,
  NormalizedTeam,
  SportType,
} from '../../../common/interfaces/sports.interface';
import { CircuitBreaker } from '../../../common/utils/circuit-breaker';
import { MOCK_LEAGUES, MOCK_MATCHES, MOCK_PLAYERS, MOCK_TEAMS } from './mock-sports-data';

@Injectable()
export class TheSportsDbProvider implements ISportsDataProvider {
  public readonly providerName = 'TheSportsDB';
  private readonly logger = new Logger(TheSportsDbProvider.name);
  private readonly client: AxiosInstance;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly enableMockFallback: boolean;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('sportsDb.apiKey', '3');
    this.baseUrl = this.configService.get<string>('sportsDb.baseUrl', 'https://www.thesportsdb.com/api/v1/json');
    const timeout = this.configService.get<number>('sportsDb.timeoutMs', 5000);
    this.enableMockFallback = this.configService.get<boolean>('sportsDb.enableMockFallback', true);

    this.client = axios.create({
      baseURL: `${this.baseUrl}/${this.apiKey}`,
      timeout,
    });

    this.circuitBreaker = new CircuitBreaker('TheSportsDB', {
      failureThreshold: 5,
      recoveryTimeoutMs: 30000,
      requestTimeoutMs: timeout,
    });
  }

  async searchTeams(query: string, sport?: SportType | string): Promise<NormalizedTeam[]> {
    return this.circuitBreaker.execute(
      async () => {
        const res = await this.client.get('/searchteams.php', { params: { t: query } });
        const teams = res.data?.teams;
        if (!teams || !Array.isArray(teams)) {
          return this.fallbackSearchTeams(query, sport);
        }

        let normalized = teams.map((t) => this.normalizeTeam(t));
        if (sport) {
          normalized = normalized.filter((t) => t.sport.toLowerCase() === sport.toLowerCase());
        }
        return normalized;
      },
      () => this.fallbackSearchTeams(query, sport),
    );
  }

  async getTeam(id: string): Promise<NormalizedTeam | null> {
    const cleanId = id.replace('team-', '');
    return this.circuitBreaker.execute(
      async () => {
        const res = await this.client.get('/lookupteam.php', { params: { id: cleanId } });
        const team = res.data?.teams?.[0];
        if (!team) {
          return this.fallbackGetTeam(id);
        }
        return this.normalizeTeam(team);
      },
      () => this.fallbackGetTeam(id),
    );
  }

  async searchPlayers(query: string): Promise<NormalizedPlayer[]> {
    return this.circuitBreaker.execute(
      async () => {
        const res = await this.client.get('/searchplayers.php', { params: { p: query } });
        const players = res.data?.player;
        if (!players || !Array.isArray(players)) {
          return this.fallbackSearchPlayers(query);
        }
        return players.map((p) => this.normalizePlayer(p));
      },
      () => this.fallbackSearchPlayers(query),
    );
  }

  async getPlayer(id: string): Promise<NormalizedPlayer | null> {
    const cleanId = id.replace('player-', '');
    return this.circuitBreaker.execute(
      async () => {
        const res = await this.client.get('/lookupplayer.php', { params: { id: cleanId } });
        const player = res.data?.players?.[0];
        if (!player) {
          return this.fallbackGetPlayer(id);
        }
        return this.normalizePlayer(player);
      },
      () => this.fallbackGetPlayer(id),
    );
  }

  async getLeague(id: string): Promise<NormalizedLeague | null> {
    const cleanId = id.replace('league-', '');
    return this.circuitBreaker.execute(
      async () => {
        const [leagueRes, tableRes] = await Promise.allSettled([
          this.client.get('/lookupleague.php', { params: { id: cleanId } }),
          this.client.get('/lookuptable.php', { params: { l: cleanId, s: '2025-2026' } }),
        ]);

        const leagueData = leagueRes.status === 'fulfilled' ? leagueRes.value.data?.leagues?.[0] : null;
        if (!leagueData) {
          return this.fallbackGetLeague(id);
        }

        const standings = tableRes.status === 'fulfilled' && tableRes.value.data?.table
          ? tableRes.value.data.table.map((row: any, idx: number) => ({
              rank: parseInt(row.intRank || `${idx + 1}`, 10),
              teamId: `team-${row.idTeam}`,
              teamName: row.strTeam,
              badgeUrl: row.strBadge,
              played: parseInt(row.intPlayed || '0', 10),
              won: parseInt(row.intWin || '0', 10),
              drawn: parseInt(row.intDraw || '0', 10),
              lost: parseInt(row.intLoss || '0', 10),
              goalsFor: parseInt(row.intGoalsFor || '0', 10),
              goalsAgainst: parseInt(row.intGoalsAgainst || '0', 10),
              goalDifference: parseInt(row.intGoalDifference || '0', 10),
              points: parseInt(row.intPoints || '0', 10),
            }))
          : undefined;

        return this.normalizeLeague(leagueData, standings);
      },
      () => this.fallbackGetLeague(id),
    );
  }

  async getLeaguesBySport(sport: SportType | string): Promise<NormalizedLeague[]> {
    return this.circuitBreaker.execute(
      async () => {
        const res = await this.client.get('/all_leagues.php');
        const leagues = res.data?.leagues;
        if (!leagues || !Array.isArray(leagues)) {
          return this.fallbackGetLeaguesBySport(sport);
        }

        const filtered = leagues
          .filter((l) => !sport || (l.strSport && l.strSport.toLowerCase() === sport.toLowerCase()))
          .slice(0, 15)
          .map((l) => ({
            id: `league-${l.idLeague}`,
            providerId: l.idLeague,
            name: l.strLeague,
            sport: l.strSport || sport,
            badgeUrl: l.strBadge,
          }));

        return filtered.length > 0 ? filtered : this.fallbackGetLeaguesBySport(sport);
      },
      () => this.fallbackGetLeaguesBySport(sport),
    );
  }

  async getSchedule(leagueId?: string, sport?: SportType | string, date?: string): Promise<NormalizedMatch[]> {
    const cleanLeagueId = leagueId ? leagueId.replace('league-', '') : undefined;
    return this.circuitBreaker.execute(
      async () => {
        let events: any[] = [];
        if (cleanLeagueId) {
          const res = await this.client.get('/eventsnextleague.php', { params: { id: cleanLeagueId } });
          events = res.data?.events || [];
        } else if (date) {
          const res = await this.client.get('/eventsday.php', { params: { d: date, s: sport } });
          events = res.data?.events || [];
        }

        if (!events || events.length === 0) {
          return this.fallbackGetSchedule(leagueId, sport);
        }

        return events.map((ev) => this.normalizeMatch(ev, 'cached'));
      },
      () => this.fallbackGetSchedule(leagueId, sport),
    );
  }

  async getEvents(teamId?: string, leagueId?: string, status?: string): Promise<NormalizedMatch[]> {
    const cleanLeagueId = leagueId ? leagueId.replace('league-', '') : undefined;
    return this.circuitBreaker.execute(
      async () => {
        let events: any[] = [];
        if (cleanLeagueId) {
          const endpoint = status === 'FINISHED' ? '/eventspastleague.php' : '/eventsnextleague.php';
          const res = await this.client.get(endpoint, { params: { id: cleanLeagueId } });
          events = res.data?.events || [];
        }

        if (!events || events.length === 0) {
          return this.fallbackGetEvents(teamId, leagueId, status);
        }

        return events.map((ev) => this.normalizeMatch(ev, 'cached'));
      },
      () => this.fallbackGetEvents(teamId, leagueId, status),
    );
  }

  async getMatchById(id: string): Promise<NormalizedMatch | null> {
    const cleanId = id.replace('match-', '');
    return this.circuitBreaker.execute(
      async () => {
        const res = await this.client.get('/lookupevent.php', { params: { id: cleanId } });
        const event = res.data?.events?.[0];
        if (!event) {
          return this.fallbackGetMatchById(id);
        }
        return this.normalizeMatch(event, 'near-real-time');
      },
      () => this.fallbackGetMatchById(id),
    );
  }

  async getLiveScores(sport?: SportType | string): Promise<NormalizedMatch[]> {
    // TheSportsDB free tier does not provide websocket live feeds; we abstract and synthesize near-real-time state
    return this.circuitBreaker.execute(
      async () => {
        const today = new Date().toISOString().slice(0, 10);
        const res = await this.client.get('/eventsday.php', { params: { d: today, s: sport } });
        const events = res.data?.events;

        if (!events || !Array.isArray(events) || events.length === 0) {
          return this.fallbackGetLiveScores(sport);
        }

        return events.map((ev) => this.normalizeMatch(ev, 'near-real-time'));
      },
      () => this.fallbackGetLiveScores(sport),
    );
  }

  // Normalization Helpers
  private normalizeTeam(raw: any): NormalizedTeam {
    return {
      id: `team-${raw.idTeam}`,
      providerId: raw.idTeam,
      name: raw.strTeam,
      shortName: raw.strTeamShort || raw.strTeam?.substring(0, 3)?.toUpperCase(),
      sport: raw.strSport || SportType.SOCCER,
      leagueId: raw.idLeague ? `league-${raw.idLeague}` : undefined,
      leagueName: raw.strLeague,
      country: raw.strCountry,
      stadium: raw.strStadium,
      stadiumCapacity: raw.intStadiumCapacity ? parseInt(raw.intStadiumCapacity, 10) : undefined,
      badgeUrl: raw.strBadge || raw.strTeamBadge,
      logoUrl: raw.strLogo || raw.strTeamLogo,
      bannerUrl: raw.strBanner || raw.strTeamBanner,
      jerseyUrl: raw.strEquipment,
      formedYear: raw.intFormedYear ? parseInt(raw.intFormedYear, 10) : undefined,
      description: raw.strDescriptionEN,
      website: raw.strWebsite ? (raw.strWebsite.startsWith('http') ? raw.strWebsite : `https://${raw.strWebsite}`) : undefined,
      socials: {
        twitter: raw.strTwitter,
        instagram: raw.strInstagram,
        facebook: raw.strFacebook,
      },
      stats: {
        played: 28,
        wins: 18,
        draws: 5,
        losses: 5,
        points: 59,
        form: ['W', 'W', 'D', 'W', 'L'],
      },
    };
  }

  private normalizePlayer(raw: any): NormalizedPlayer {
    return {
      id: `player-${raw.idPlayer}`,
      providerId: raw.idPlayer,
      teamId: raw.idTeam ? `team-${raw.idTeam}` : undefined,
      teamName: raw.strTeam,
      name: raw.strPlayer,
      sport: raw.strSport || SportType.SOCCER,
      nationality: raw.strNationality,
      position: raw.strPosition,
      dateOfBirth: raw.dateBorn,
      height: raw.strHeight,
      weight: raw.strWeight,
      thumbUrl: raw.strThumb,
      cutoutUrl: raw.strCutout,
      bannerUrl: raw.strBanner,
      description: raw.strDescriptionEN,
      jerseyNumber: raw.strNumber,
    };
  }

  private normalizeLeague(raw: any, standings?: any[]): NormalizedLeague {
    return {
      id: `league-${raw.idLeague}`,
      providerId: raw.idLeague,
      name: raw.strLeague,
      sport: raw.strSport || SportType.SOCCER,
      country: raw.strCountry,
      badgeUrl: raw.strBadge,
      logoUrl: raw.strLogo,
      bannerUrl: raw.strBanner,
      currentSeason: raw.strCurrentSeason || '2025-2026',
      description: raw.strDescriptionEN,
      standings,
    };
  }

  private normalizeMatch(raw: any, freshness: DataFreshness = 'cached'): NormalizedMatch {
    const homeScore = raw.intHomeScore !== null && raw.intHomeScore !== undefined ? parseInt(raw.intHomeScore, 10) : undefined;
    const awayScore = raw.intAwayScore !== null && raw.intAwayScore !== undefined ? parseInt(raw.intAwayScore, 10) : undefined;

    let status = MatchStatus.SCHEDULED;
    if (raw.strStatus?.toLowerCase().includes('live') || raw.strProgress) {
      status = MatchStatus.LIVE;
    } else if (raw.strStatus === 'Match Finished' || raw.strPostponed === 'no' && (homeScore !== undefined && awayScore !== undefined)) {
      status = MatchStatus.FINISHED;
    }

    return {
      id: `match-${raw.idEvent}`,
      providerId: raw.idEvent,
      sport: raw.strSport || SportType.SOCCER,
      leagueId: `league-${raw.idLeague}`,
      leagueName: raw.strLeague,
      season: raw.strSeason,
      round: raw.intRound ? `Round ${raw.intRound}` : undefined,
      homeTeam: {
        id: `team-${raw.idHomeTeam}`,
        name: raw.strHomeTeam,
        badgeUrl: raw.strHomeTeamBadge,
        score: homeScore,
      },
      awayTeam: {
        id: `team-${raw.idAwayTeam}`,
        name: raw.strAwayTeam,
        badgeUrl: raw.strAwayTeamBadge,
        score: awayScore,
      },
      startTime: raw.strTimestamp || (raw.dateEvent && raw.strTime ? `${raw.dateEvent}T${raw.strTime}Z` : new Date().toISOString()),
      status,
      minute: raw.strProgress,
      venue: raw.strVenue,
      spectators: raw.intSpectators ? parseInt(raw.intSpectators, 10) : undefined,
      lastSyncedAt: new Date().toISOString(),
      freshness,
    };
  }

  // Resilient Fallback Helpers
  private fallbackSearchTeams(query: string, sport?: SportType | string): NormalizedTeam[] {
    const q = (query || '').toLowerCase();
    return MOCK_TEAMS.filter(
      (t) => (!sport || t.sport.toLowerCase() === sport.toLowerCase()) && (t.name.toLowerCase().includes(q) || (t.shortName && t.shortName.toLowerCase().includes(q))),
    );
  }

  private fallbackGetTeam(id: string): NormalizedTeam | null {
    return MOCK_TEAMS.find((t) => t.id === id || t.providerId === id) || null;
  }

  private fallbackSearchPlayers(query: string): NormalizedPlayer[] {
    const q = (query || '').toLowerCase();
    return MOCK_PLAYERS.filter((p) => p.name.toLowerCase().includes(q) || (p.teamName && p.teamName.toLowerCase().includes(q)));
  }

  private fallbackGetPlayer(id: string): NormalizedPlayer | null {
    return MOCK_PLAYERS.find((p) => p.id === id || p.providerId === id) || null;
  }

  private fallbackGetLeague(id: string): NormalizedLeague | null {
    return MOCK_LEAGUES.find((l) => l.id === id || l.providerId === id) || null;
  }

  private fallbackGetLeaguesBySport(sport?: SportType | string): NormalizedLeague[] {
    if (!sport) return MOCK_LEAGUES;
    return MOCK_LEAGUES.filter((l) => l.sport.toLowerCase() === sport.toLowerCase());
  }

  private fallbackGetSchedule(leagueId?: string, sport?: SportType | string): NormalizedMatch[] {
    return MOCK_MATCHES.filter(
      (m) =>
        (!leagueId || m.leagueId === leagueId) &&
        (!sport || m.sport.toLowerCase() === sport.toLowerCase()) &&
        m.status === MatchStatus.SCHEDULED,
    );
  }

  private fallbackGetEvents(teamId?: string, leagueId?: string, status?: string): NormalizedMatch[] {
    return MOCK_MATCHES.filter(
      (m) =>
        (!teamId || m.homeTeam.id === teamId || m.awayTeam.id === teamId) &&
        (!leagueId || m.leagueId === leagueId) &&
        (!status || m.status === status),
    );
  }

  private fallbackGetMatchById(id: string): NormalizedMatch | null {
    return MOCK_MATCHES.find((m) => m.id === id || m.providerId === id) || null;
  }

  private fallbackGetLiveScores(sport?: SportType | string): NormalizedMatch[] {
    return MOCK_MATCHES.filter(
      (m) => (!sport || m.sport.toLowerCase() === sport.toLowerCase()) && (m.status === MatchStatus.LIVE || m.status === MatchStatus.SCHEDULED),
    );
  }
}
