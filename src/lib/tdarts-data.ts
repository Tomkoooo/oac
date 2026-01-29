import dbConnect from './db';
import { ClubModel } from '@/database/models/club.model';
import { LeagueModel } from '@/database/models/league.model';
import { TournamentModel } from '@/database/models/tournament.model';
import { PlayerModel } from '@/database/models/player.model';
import { UserModel } from '@/database/models/user.model';
import { MatchModel } from '@/database/models/match.model';
import { LogModel } from '@/database/models/log.model';
import { Types } from 'mongoose';
import { DEFAULT_LEAGUE_POINTS_CONFIG } from '@/interface/league.interface';

import { tdartsDb } from '@/lib/tdarts-db';

// Ensure DB is connected before any operation
const ensureDb = async () => {
    // Connect to OAC DB
    await dbConnect();
    // Ensure tDarts DB is connected (wait for it)
    await tdartsDb.asPromise(); 
};

export interface Club {
  _id: string;
  name: string;
  location: string;
  verified: boolean;
  logo?: string;
  memberCount?: number;
  tournamentCount?: number;
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

export interface Tournament {
  _id: string;
  tournamentId?: string;
  tournamentSettings: any;
  clubId?: any;
  league?: any;
  verified?: boolean;
  playerCount?: number;
}

export const getVerifiedClubs = async () => {
  await ensureDb();
  
  const clubs = await ClubModel.aggregate([
      {
        $match: {
          verified: true,
          isActive: true,
          isDeleted: { $ne: true }
        }
      },
      {
        $lookup: {
          from: 'tournaments',
          let: { clubId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$clubId', '$$clubId'] },
                isDeleted: { $ne: true },
                isCancelled: { $ne: true }
              }
            }
          ],
          as: 'tournaments'
        }
      },
      {
        $addFields: {
          memberCount: { $size: { $ifNull: ['$members', []] } },
          tournamentCount: { $size: '$tournaments' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          location: 1,
          verified: 1,
          isActive: 1,
          createdAt: 1,
          memberCount: 1,
          tournamentCount: 1,
          logo: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    const serializedClubs = clubs.map((club: any) => ({
      ...club,
      _id: club._id.toString(),
      members: club.members?.map((m: any) => m.toString()) || [],
      admin: club.admin?.map((a: any) => a.toString()) || [],
      moderators: club.moderators?.map((m: any) => m.toString()) || [],
      tournaments: club.tournaments?.map((t: any) => ({
        ...t,
        _id: t._id.toString(),
        clubId: t.clubId?.toString()
      })) || []
    }));

    return {
      clubs: serializedClubs,
      stats: {
        total: clubs.length,
        verified: clubs.length,
        unverified: 0
      }
    };
};

export const getVerifiedLeagues = async () => {
    await ensureDb();
    const leagues = await LeagueModel.find({ verified: true, isActive: true })
        .populate('club', 'name location logo')
        .sort({ createdAt: -1 })
        .lean();
    
    const serializedLeagues = leagues.map((league: any) => {
        try {
            return {
                ...league,
                _id: league._id?.toString(),
                club: league.club ? {
                    ...league.club,
                    _id: league.club._id?.toString()
                } : undefined,
                createdBy: league.createdBy?.toString(),
                attachedTournaments: league.attachedTournaments?.map((t: any) => 
                    typeof t === 'object' && t._id ? t._id.toString() : t?.toString()
                ) || [],
                players: league.players?.map((p: any) => ({
                    ...p,
                    player: p.player?.toString(),
                    tournamentPoints: p.tournamentPoints?.map((tp: any) => ({
                        ...tp,
                        tournament: tp.tournament?.toString()
                    })) || [],
                    manualAdjustments: p.manualAdjustments?.map((ma: any) => ({
                        ...ma,
                        adjustedBy: ma.adjustedBy?.toString()
                    })) || []
                })) || [],
                removedPlayers: league.removedPlayers?.map((rp: any) => ({
                    ...rp,
                    player: rp.player?.toString(),
                    removedBy: rp.removedBy?.toString(),
                    tournamentPoints: rp.tournamentPoints?.map((tp: any) => ({
                        ...tp,
                        tournament: tp.tournament?.toString()
                    })) || [],
                    manualAdjustments: rp.manualAdjustments?.map((ma: any) => ({
                        ...ma,
                        adjustedBy: ma.adjustedBy?.toString()
                    })) || []
                })) || []
            };
        } catch (e) {
            console.error('Error serializing league:', league._id, e);
            return null;
        }
    }).filter(Boolean);
    
    // Transform to match expected interface if needed, or return as is
    return { leagues: serializedLeagues };
};

export const getVerifiedTournaments = async (limit = 50, skip = 0, status?: string, leagueId?: string) => {
    await ensureDb();

    try {
        const query = {
            verified: true,
            isDeleted: { $ne: true },
            isCancelled: { $ne: true }
        };
        console.log('[getVerifiedTournaments] Query:', query);
        
        const tournaments = await TournamentModel.find(query)
          .populate('clubId', 'name location')
          .populate('league', 'name verified')
          .sort({ 'tournamentSettings.startDate': -1 })
          .limit(limit)
          .skip(skip)
          .lean();

        console.log(`[getVerifiedTournaments] Found ${tournaments.length} raw tournaments`);

        const total = await TournamentModel.countDocuments(query);

        const serializedTournaments = tournaments.map((t: any) => {
            try {
                return {
                    _id: t._id?.toString(),
                    tournamentId: t.tournamentId,
                    name: t.tournamentSettings?.name,
                    startDate: t.tournamentSettings?.startDate,
                    status: t.tournamentSettings?.status,
                    location: t.tournamentSettings?.location,
                    club: (t.clubId && t.clubId._id) ? {
                        ...t.clubId,
                        _id: t.clubId._id.toString()
                    } : undefined,
                    league: (t.league && t.league._id) ? {
                        ...t.league,
                        _id: t.league._id.toString()
                    } : undefined,
                    verified: t.verified || false,
                    playerCount: t.tournamentPlayers?.length || 0,
                    tournamentSettings: t.tournamentSettings
                };
            } catch (err) {
                console.error('[getVerifiedTournaments] Serialization Error for tournament:', t._id, err);
                return null;
            }
        }).filter(Boolean);

        return {
          tournaments: serializedTournaments,
          total,
          limit,
          skip
        };
    } catch (error) {
        console.error('[getVerifiedTournaments] Fatal Error:', error);
        return { tournaments: [], total: 0, limit, skip };
    }
};

export const getOacRankings = async (limit = 20, skip = 0, search = '') => {
    await ensureDb();
    
    // ... rest of function ... (just needed to close the previous block for context if needed, but keeping scope tight)
    // Actually, I need to match the StartLine with valid context.
    const pipeline: any[] = [
      {
        $match: {
          verified: true,
          isDeleted: false,
          isCancelled: false,
          isSandbox: { $ne: true }
        }
      },
      { $unwind: '$tournamentPlayers' },
      {
        $group: {
          _id: { $toObjectId: '$tournamentPlayers.playerReference' },
          verifiedAvg: { $avg: '$tournamentPlayers.stats.avg' },
          verifiedMaxAvg: { $max: '$tournamentPlayers.stats.avg' },
          verifiedMaxCheckout: { $max: '$tournamentPlayers.stats.highestCheckout' },
          verifiedTotal180s: { $sum: '$tournamentPlayers.stats.oneEightiesCount' },
          verifiedTournamentsPlayed: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'players',
          localField: '_id',
          foreignField: '_id',
          as: 'playerDoc'
        }
      },
      { $unwind: '$playerDoc' },
      {
        $project: {
          _id: 1,
          name: '$playerDoc.name',
          oacMmr: { $ifNull: ['$playerDoc.stats.oacMmr', 800] },
          avg: { $round: ['$verifiedAvg', 2] },
          maxAvg: { $round: ['$verifiedMaxAvg', 2] },
          maxCheckout: { $ifNull: ['$verifiedMaxCheckout', 0] },
          total180s: { $ifNull: ['$verifiedTotal180s', 0] },
          tournamentsPlayed: '$verifiedTournamentsPlayed'
        }
      }
    ];

    if (search) {
      pipeline.push({
        $match: {
          name: { $regex: search, $options: 'i' }
        }
      });
    }

    pipeline.push({ $sort: { oacMmr: -1, name: 1 } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await TournamentModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const rankings = await TournamentModel.aggregate(pipeline);

    const serializedRankings = rankings.map((r: any) => ({
        ...r,
        _id: r._id?.toString()
    }));

    return { rankings: serializedRankings, total };
};

export const getPublicRankings = async () => {
    await ensureDb();
    
    // Fetch all players with oacMmr != 800 (default)
    // Assuming 800 is the default unranked value as per Player schema
    
    const players = await PlayerModel.find({
        'stats.oacMmr': { $ne: 800 },
        isRegistered: true // Only list registered players? Usually rankings are for verified players
        // Based on user request "all players that has a not 800 oacMMr"
    })
    .select('name stats.oacMmr stats.avg stats.highestCheckout stats.oneEightiesCount stats.tournamentsPlayed')
    .sort({ 'stats.oacMmr': -1 })
    .lean();
    
    // Serialize
    return players.map((p: any) => ({
        _id: p._id.toString(),
        name: p.name,
        oacMmr: p.stats?.oacMmr || 800,
        avg: p.stats?.avg || 0,
        maxCheckout: p.stats?.highestCheckout || 0,
        total180s: p.stats?.oneEightiesCount || 0,
        tournamentsPlayed: p.stats?.tournamentsPlayed || 0
    }));
};

// Growth Data Helper
function getGrowthData(items: any[]) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    const recentItems = items.filter(item => new Date(item.createdAt) >= sixMonthsAgo);

    const monthlyCounts: { [key: string]: number } = {};
    const monthKeys = [];
    for(let i=0; i<6; i++) {
        const d = new Date(sixMonthsAgo);
        d.setMonth(d.getMonth() + i);
        const key = d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });
        monthlyCounts[key] = 0;
        monthKeys.push(key);
    }

    let runningTotal = items.filter(item => new Date(item.createdAt) < sixMonthsAgo).length;
    recentItems.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const result = [];
    for(let i=0; i<monthKeys.length; i++) {
        const d = new Date(sixMonthsAgo);
        d.setMonth(d.getMonth() + i);
        const label = monthKeys[i];
        
        const nextMonth = new Date(d);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const countInMonth = items.filter(item => {
            const c = new Date(item.createdAt);
            return c >= d && c < nextMonth;
        }).length;

        runningTotal += countInMonth;
        result.push({ name: label, value: runningTotal });
    }
    return result;
}

export const getOacStats = async () => {
    await ensureDb();
    
    // 1. OAC Leagues
    const oacLeagues = await LeagueModel.find({ verified: true, isActive: true }).lean();
    
    // 2. Verified Tournaments
    const verifiedTournaments = await TournamentModel.find({
        verified: true,
        isDeleted: false,
        isCancelled: false,
    }).select('_id createdAt').lean();
    
    // 3. Unique Players
    const uniquePlayersResult = await TournamentModel.aggregate([
        { $match: { verified: true, isDeleted: false, isCancelled: false } },
        { $unwind: '$tournamentPlayers' },
        { $group: { _id: null, uniquePlayers: { $addToSet: '$tournamentPlayers.playerReference' } } }
    ]);
    const uniquePlayerCount = uniquePlayersResult[0]?.uniquePlayers?.length || 0;

    // 4. Verified Clubs
    const verifiedClubs = await ClubModel.find({ verified: true, isActive: true }).select('createdAt').lean();

    // 5. Recent Logs
    const recentLogs = await LogModel.find({
        category: { $in: ['auth', 'club', 'tournament', 'system'] },
        level: { $ne: 'error' } 
    }).sort({ timestamp: -1 }).limit(20).lean();

    // 6. Pending Applications from OAC Application Model (NOT tDarts clubs)
    const { Application } = await import('@/models');
    const pendingApplications = await Application.find({ 
        status: 'submitted' 
    })
    .select('clubName applicantName applicantEmail submittedAt')
    .sort({ submittedAt: -1 })
    .limit(10)
    .lean();

    // 7. Growth
    const clubGrowth = getGrowthData(verifiedClubs);
    const tournamentGrowth = getGrowthData(verifiedTournaments);

    // 8. Integrity - Suspicious Matches (matches with manual overrides or flags)
    const suspiciousMatches = await MatchModel.find({
        $or: [
            { 'manualOverride.applied': true },
            { 'flags.suspicious': true },
            { 'flags.reported': true }
        ]
    })
    .populate('tournamentId', 'tournamentSettings.name tournamentId')
    .sort({ 'manualOverride.timestamp': -1, updatedAt: -1 })
    .limit(100)
    .lean();

    return {
        globalStats: { 
            totalLeagues: oacLeagues.length, 
            totalTournaments: verifiedTournaments.length, 
            totalPlayers: uniquePlayerCount,
            verifiedClubCount: verifiedClubs.length
        },
        growthStats: {
            clubs: clubGrowth,
            tournaments: tournamentGrowth
        },
        recentLogs: recentLogs.map((log: any) => ({
            id: log._id,
            user: {
                name: log.userRole || 'System',
                email: log.category,
                image: null
            },
            action: log.message,
            date: new Date(log.timestamp).toLocaleTimeString('hu-HU', { hour: '2-digit', minute:'2-digit' }),
            type: log.level === 'warn' ? 'warning' : 'info'
        })),
        pendingApplications: pendingApplications.map((app: any) => ({
            _id: app._id,
            clubName: app.clubName,
            status: 'submitted',
            submittedAt: app.submittedAt
        })),
        integrityStats: {
            totalFlagged: suspiciousMatches.length,
            suspiciousMatches: suspiciousMatches.map((match: any) => ({
                _id: match._id,
                tournamentName: match.tournamentId?.tournamentSettings?.name || 'Unknown',
                tournamentCode: match.tournamentId?.tournamentId || 'N/A',
                player1: {
                    playerId: { name: match.player1?.name || 'Player 1' },
                    score: match.player1?.score || 0
                },
                player2: {
                    playerId: { name: match.player2?.name || 'Player 2' },
                    score: match.player2?.score || 0
                },
                overrideType: match.manualOverride?.reason || 'Flag',
                overrideBy: match.manualOverride?.by || 'System',
                overrideTimestamp: match.manualOverride?.timestamp || match.updatedAt,
                flags: match.flags || {}
            }))
        }
    };
};

export const getOacPlayersExport = async () => {
    await ensureDb();
    
    return await TournamentModel.aggregate([
      {
        $match: { verified: true, isDeleted: false, isCancelled: false }
      },
      { $unwind: '$tournamentPlayers' },
      { $addFields: { playerRefObj: { $toObjectId: '$tournamentPlayers.playerReference' } } },
      {
        $lookup: {
          from: 'players',
          localField: 'playerRefObj',
          foreignField: '_id',
          as: 'playerDoc'
        }
      },
      { $unwind: '$playerDoc' },
      {
        $lookup: {
          from: 'users',
          localField: 'playerDoc.userRef',
          foreignField: '_id',
          as: 'userDoc'
        }
      },
      { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$playerDoc._id',
          name: { $first: '$playerDoc.name' },
          email: { $first: '$userDoc.email' },
          phone: { $first: '$userDoc.phone' },
          city: { $first: '$userDoc.city' },
          dateOfBirth: { $first: '$userDoc.dateOfBirth' },
          createdAt: { $first: '$playerDoc.createdAt' },
          totalTournaments: { $sum: 1 },
          averageStats: {
            $push: {
              tournamentId: '$_id',
              tournamentName: '$tournamentSettings.name',
              avg: '$tournamentPlayers.stats.avg',
              oneEighties: '$tournamentPlayers.stats.oneEightiesCount',
              highestCheckout: '$tournamentPlayers.stats.highestCheckout'
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          city: 1,
          dateOfBirth: 1,
          createdAt: 1,
          totalTournaments: 1,
          overallAverage: { $avg: '$averageStats.avg' },
          maxAverage: { $max: '$averageStats.avg' },
          totalOneEighties: { $sum: '$averageStats.oneEighties' },
          maxCheckout: { $max: '$averageStats.highestCheckout' },
          tournaments: '$averageStats'
        }
      },
      { $sort: { overallAverage: -1 } }
    ]);
};

export const getUserClubs = async (userId: string) => {
    await ensureDb();
    // In tDarts, user clubs were fetched via /api/users/me/clubs which probably looked for admin/moderator/member fields
    // ClubModel has: admin: [ObjectId], moderators: [ObjectId], members: [ObjectId]
    // We want clubs where user is admin or moderator mainly?
    // Let's assume admin or moderator for specific "management" purpose or all for list?
    // tDarts implementation of /api/users/me/clubs usually returns clubs where user is admin or moderator.
    
    // We need to convert userId string to ObjectId if strict matching
    
    return await ClubModel.find({
        $or: [
            { admin: userId },
            { moderators: userId }
        ],
        isActive: true
    }).sort({ createdAt: -1 }).lean();
};

export const createOacLeague = async (clubId: string, creatorId: string, name: string, description?: string) => {
    await ensureDb();
    
    // Check for duplicate
    const existingLeague = await LeagueModel.findOne({ 
      club: clubId, 
      name: name,
      isActive: true 
    });
    
    if (existingLeague) {
      throw new Error('A league with this name already exists in the club');
    }

    // Create League
    const league = new LeagueModel({
      name,
      description: description || '',
      club: clubId,
      pointsConfig: DEFAULT_LEAGUE_POINTS_CONFIG,
      pointSystemType: 'remiz_christmas',
      createdBy: creatorId,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      attachedTournaments: [],
      players: [],
      verified: true,
      isActive: true
    });

    try {
      console.log(`[tdarts-data] Attempting to save league for club ${clubId}...`);
      await league.save();
      console.log(`[tdarts-data] League saved successfully: ${league._id}`);
    } catch (saveError: any) {
      console.error(`[tdarts-data] FATAL: league.save() failed:`, saveError);
      throw saveError;
    }

    // Verify Club
    const updatedClub = await ClubModel.findByIdAndUpdate(
      clubId, 
      { verified: true }, 
      { new: true }
    );

    return { league, updatedClub };
};

export const removeOacLeague = async (clubId: string, removalType: 'delete_league' | 'terminate_league' = 'delete_league') => {
    await ensureDb();

    const league = await LeagueModel.findOne({ 
      club: clubId, 
      verified: true 
    });
    
    if (!league) {
      throw new Error('Verified league not found for this club');
    }

    if (removalType === 'delete_league') {
      await LeagueModel.findByIdAndDelete(league._id);
    } else {
      await LeagueModel.findByIdAndUpdate(league._id, { 
        isActive: false,
        verified: false,
        endDate: new Date()
      });
    }

    // Unverify Club
    await ClubModel.findByIdAndUpdate(clubId, { verified: false });

    return { success: true };
};

export const getUserById = async (userId: string) => {
    await ensureDb();
    const user = await UserModel.findById(userId).lean();
    if (!user) return null;
    
    // Also fetch associated player to get player details if needed
    // But UserModel has reference to player usually? 
    // Let's check schema. UserSchema has playerRef?
    // Based on user.model.ts: it has no direct playerRef usually? 
    // PlayerModel has userRef.
    
    // We can do reverse lookup if needed
    const player = await PlayerModel.findOne({ userRef: userId }).lean();
    
    return { ...user, player };
};

export const createClub = async (creatorId: string, clubData: { name: string, description: string, location: string, address?: string, contact?: any }) => {
    await ensureDb();
    
    // 1. Create Club
    const club = new ClubModel({
      ...clubData,
      admin: [creatorId], // Set creator as admin
      verified: false, // Default unverified
      isActive: true,
      members: [creatorId] // Add creator as member
    });
    
    await club.save();
    
    // 2. Update User (if needed) - usually tDarts stores club roles in Club model, not user model permissions?
    // Checking User model: roles: ['user', 'admin'...]
    // Does it track clubs? No.
    
    // 3. Ensure Player exists for creator? (Usually done at registration)
    
    return club;
};
