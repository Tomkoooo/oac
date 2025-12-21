import axios from 'axios';

const TDARTS_API_URL = process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu';
const PROXY_API_URL = '/api/tdarts';

// Original client for auth/user endpoints (direct access)
export const tdartsApi = axios.create({
  baseURL: TDARTS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Proxy client for verified public data (injects secret server-side)
export const tdartsProxyApi = axios.create({
  baseURL: PROXY_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Club {
  _id: string;
  name: string;
  location: string;
  verified: boolean;
  logo?: string;
  memberCount?: number;
}

export interface League {
  _id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  verified: boolean;
  club?: Club | string;
  isActive?: boolean;
  tournamentCount?: number;
}

export interface TournamentSettings {
  name: string;
  startDate: string;
  endDate?: string;
  status: 'pending' | 'ongoing' | 'finished' | 'active' | 'group-stage' | 'knockout'; // Added ongoing/active aliases
  location?: string;
  type?: 'amateur' | 'open';
  entryFee?: number;
  maxPlayers?: number;
  registrationDeadline?: string;
  description?: string;
}

export interface Tournament {
  _id: string;
  tournamentId?: string;
  tournamentSettings: TournamentSettings;
  clubId?: Club | string;
  league?: League | string;
  isVerified?: boolean; // Legacy field
  verified?: boolean;   // New field
  playerCount?: number;
}

export interface RankingPlayer {
  _id: string;
  name: string;
  oacMmr: number;
  avg: number;
  maxAvg: number;
  maxCheckout: number;
  total180s: number;
  tournamentsPlayed: number;
}

/**
 * Fetch verified data from the new public endpoints via proxy
 */
export const getPublicData = async (type: 'leagues' | 'tournaments' | 'clubs' | 'all' = 'all') => {
  try {
    const result: { leagues: League[]; tournaments: Tournament[]; clubs: Club[] } = {
      leagues: [],
      tournaments: [],
      clubs: []
    };

    const promises = [];

    if (type === 'clubs' || type === 'all') {
      promises.push(
        tdartsProxyApi.get('/public/verified-clubs').then(res => {
          result.clubs = res.data.clubs || [];
        })
      );
    }

    if (type === 'leagues' || type === 'all') {
      promises.push(
        tdartsProxyApi.get('/public/verified-leagues').then(res => {
          result.leagues = res.data.leagues || [];
        })
      );
    }

    if (type === 'tournaments' || type === 'all') {
      promises.push(
        tdartsProxyApi.get('/public/verified-tournaments', { params: { limit: 50 } }).then(res => {
          result.tournaments = res.data.tournaments || [];
        })
      );
    }

    await Promise.allSettled(promises);
    return result;
  } catch (error) {
    console.error('Error fetching verified public data:', error);
    return { leagues: [], tournaments: [], clubs: [] };
  }
};

/**
 * Fetch OAC Rankings with search and pagination
 */
export const getOacRankings = async (params: { search?: string; limit?: number; skip?: number }) => {
  try {
    const response = await tdartsProxyApi.get('/public/oac/rankings', { params });
    return {
      rankings: (response.data.rankings || []) as RankingPlayer[],
      total: (response.data.total || 0) as number
    };
  } catch (error) {
    console.error('Error fetching OAC rankings:', error);
    return { rankings: [], total: 0 };
  }
};


