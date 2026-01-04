import { BoardDocument } from '@/interface/board.interface';
import { GenerateRandomHash } from '@/lib/utils';
import mongoose from 'mongoose';

import { tdartsDb } from '@/lib/tdarts-db';

export const BoardSchema = new mongoose.Schema<BoardDocument>({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clubs', required: true },
  boardId: { type: String, required: true, default: () => GenerateRandomHash(16) },
  currentMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  boardNumber: { type: Number },
  status: { type: String, enum: ['idle', 'waiting', 'playing'], default: 'idle' },
  waitingPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  scoliaSerialNumber: { type: String, default: null },
  scoliaAccessToken: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'boards' });

// Indexek
BoardSchema.index({ tournamentId: 1, boardId: 1 }, { unique: true });

// Middleware az updatedAt frissítéséhez
BoardSchema.pre('save', function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const BoardModel = tdartsDb.models.Board || tdartsDb.model<BoardDocument>('Board', BoardSchema);