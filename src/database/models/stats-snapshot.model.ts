import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

// Schema for tracking daily statistics snapshots
const StatsSnapshotSchema = new Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  clubs: {
    total: { type: Number, default: 0 },
    verified: { type: Number, default: 0 },
    unverified: { type: Number, default: 0 },
    active: { type: Number, default: 0 }
  },
  tournaments: {
    total: { type: Number, default: 0 },
    verified: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },
  players: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 }
  },
  applications: {
    pending: { type: Number, default: 0 },
    approved: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Method to create today's snapshot
StatsSnapshotSchema.statics.createTodaySnapshot = async function() {
  const { ClubModel } = await import('./club.model');
  const { TournamentModel } = await import('./tournament.model');
  const { Application } = await import('../../models');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if snapshot already exists for today
  const existing = await this.findOne({ date: today });
  if (existing) {
    return existing;
  }
  
  // Gather statistics
  const clubStats = {
    total: await ClubModel.countDocuments({ verified: true }),
    verified: await ClubModel.countDocuments({ verified: true }),
    unverified: await ClubModel.countDocuments({ verified: false }),
    active: await ClubModel.countDocuments({ verified: true, isActive: true })
  };
  
  const tournamentStats = {
    total: await TournamentModel.countDocuments({ verified: true, isDeleted: false }),
    verified: await TournamentModel.countDocuments({ verified: true, isDeleted: false }),
    active: await TournamentModel.countDocuments({ verified: true, isDeleted: false, isCancelled: false, status: { $ne: 'finished' } }),
    completed: await TournamentModel.countDocuments({ verified: true, status: 'finished' })
  };
  
  // Get unique players from tournaments
  const uniquePlayersResult = await TournamentModel.aggregate([
    { $match: { verified: true, isDeleted: false } },
    { $unwind: '$tournamentPlayers' },
    { $group: { _id: null, uniquePlayers: { $addToSet: '$tournamentPlayers.playerReference' } } }
  ]);
  const totalPlayers = uniquePlayersResult[0]?.uniquePlayers?.length || 0;
  
  const applicationStats = {
    pending: await Application.countDocuments({ status: 'submitted' }),
    approved: await Application.countDocuments({ status: 'approved' }),
    rejected: await Application.countDocuments({ status: 'rejected' })
  };
  
  // Create snapshot
  const snapshot = await this.create({
    date: today,
    clubs: clubStats,
    tournaments: tournamentStats,
    players: {
      total: totalPlayers,
      active: totalPlayers // For now, consider all as active
    },
    applications: applicationStats
  });
  
  return snapshot;
};

// Method to get historical data for charts
StatsSnapshotSchema.statics.getHistoricalData = async function(days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const snapshots = await this.find({
    date: { $gte: startDate }
  }).sort({ date: 1 }).lean();
  
  return snapshots;
};

export const StatsSnapshot = models.StatsSnapshot || model('StatsSnapshot', StatsSnapshotSchema);
