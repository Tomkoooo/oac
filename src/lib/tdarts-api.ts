import axios from 'axios';

const TDARTS_API_URL = process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu';

export const tdartsApi = axios.create({
  baseURL: TDARTS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface League {
  _id: string;
  name: string;
  // Add other fields as needed
}

export interface Tournament {
  _id: string;
  name: string;
  date: string;
  // Add other fields as needed
}

export const getPublicData = async (type: 'leagues' | 'tournaments' | 'all' = 'all') => {
  try {
    const response = await tdartsApi.get('/api/public/data', {
      params: { type },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching public data:', error);
    return { leagues: [], tournaments: [] };
  }
};
