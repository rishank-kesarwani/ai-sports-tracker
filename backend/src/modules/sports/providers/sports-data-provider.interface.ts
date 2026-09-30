import {
  NormalizedLeague,
  NormalizedMatch,
  NormalizedPlayer,
  NormalizedTeam,
  SportType,
} from '../../../common/interfaces/sports.interface';

export interface ISportsDataProvider {
  readonly providerName: string;

  searchTeams(query: string, sport?: SportType | string): Promise<NormalizedTeam[]>;
  getTeam(id: string): Promise<NormalizedTeam | null>;
  searchPlayers(query: string): Promise<NormalizedPlayer[]>;
  getPlayer(id: string): Promise<NormalizedPlayer | null>;
  getLeague(id: string): Promise<NormalizedLeague | null>;
  getLeaguesBySport(sport: SportType | string): Promise<NormalizedLeague[]>;
  getSchedule(leagueId?: string, sport?: SportType | string, date?: string): Promise<NormalizedMatch[]>;
  getEvents(teamId?: string, leagueId?: string, status?: string): Promise<NormalizedMatch[]>;
  getMatchById(id: string): Promise<NormalizedMatch | null>;
  getLiveScores(sport?: SportType | string): Promise<NormalizedMatch[]>;
}
