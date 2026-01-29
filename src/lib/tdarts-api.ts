"use server";

import { getVerifiedClubs, getVerifiedLeagues, getVerifiedTournaments, getOacRankings as getOacRankingsFromDb } from './tdarts-data';

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
  status: 'pending' | 'ongoing' | 'finished' | 'active' | 'group-stage' | 'knockout';
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
  isVerified?: boolean;
  verified?: boolean;
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
 * Fetch verified data directly from database
 */
export const getPublicData = async (type: 'leagues' | 'tournaments' | 'clubs' | 'rankings' | 'all' = 'all') => {
  try {
    const result: { leagues: League[]; tournaments: Tournament[]; clubs: Club[]; rankings?: RankingPlayer[] } = {
      leagues: [],
      tournaments: [],
      clubs: [],
      rankings: []
    };

    const promises = [];

    if (type === 'clubs' || type === 'all') {
      promises.push(
        getVerifiedClubs().then(data => {
          result.clubs = (data.clubs as unknown) as Club[] || [];
        })
      );
    }

    if (type === 'leagues' || type === 'all') {
      promises.push(
        getVerifiedLeagues().then(data => {
          result.leagues = (data.leagues as unknown) as League[] || [];
        })
      );
    }

    if (type === 'tournaments' || type === 'all') {
      promises.push(
        getVerifiedTournaments(50).then(data => {
          result.tournaments = (data.tournaments as unknown) as Tournament[] || [];
        })
      );
    }
    
    if (type === 'rankings' || type === 'all') {
        const { getPublicRankings } = await import('./tdarts-data');
        promises.push(
            getPublicRankings().then(data => {
                // @ts-ignore
                result.rankings = data;
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
 * Fetch OAC Rankings directly from database
 */
export const getOacRankings = async (params: { search?: string; limit?: number; skip?: number }) => {
  try {
    const { rankings, total } = await getOacRankingsFromDb(params.limit || 20, params.skip || 0, params.search);
    return {
      rankings: (rankings || []) as RankingPlayer[],
      total: (total || 0) as number
    };
  } catch (error) {
    console.error('Error fetching OAC rankings:', error);
    return { rankings: [], total: 0 };
  }
};


