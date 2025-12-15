import axios from 'axios';

const TDARTS_API_URL = process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu';

export const tdartsApi = axios.create({
  baseURL: TDARTS_API_URL,
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
}

export interface TournamentSettings {
  name: string;
  startDate: string;
  endDate?: string;
  status: 'pending' | 'active' | 'finished' | 'group-stage' | 'knockout';
  location?: string;
  type?: 'amateur' | 'open';
  entryFee?: number;
  maxPlayers?: number;
  registrationDeadline?: string;
  description?: string;
}

export interface Tournament {
  _id: string;
  tournamentSettings: TournamentSettings;
  clubId?: Club | string;
  league?: League | string;
  isVerified?: boolean;
}

export const getPublicData = async (type: 'leagues' | 'tournaments' | 'clubs' | 'all' = 'all') => {
  try {
    const response = await tdartsApi.get('/api/public/data', {
      params: { type },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching public data:', error);
    return { leagues: [], tournaments: [], clubs: [] };
  }
};
