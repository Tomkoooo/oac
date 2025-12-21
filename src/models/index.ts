import { Schema, model, models } from 'mongoose';

// AdminUser Model
const AdminUserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
}, { timestamps: true });

export const AdminUser = models.AdminUser || model('AdminUser', AdminUserSchema);

// Subscription Model
const SubscriptionSchema = new Schema({
  clubId: { type: String, required: true }, // Reference to tDarts Club ID
  clubName: { type: String, required: true },
  plan: { type: String, enum: ['basic', 'premium', 'national_league'], required: true },
  status: { type: String, enum: ['active', 'pending', 'expired'], default: 'pending' },
  startDate: { type: Date },
  endDate: { type: Date },
  paymentHistory: { type: Array, default: [] },
}, { timestamps: true });

export const Subscription = models.Subscription || model('Subscription', SubscriptionSchema);

// Application Model
const ApplicationSchema = new Schema({
  clubId: { type: String, required: true }, // Reference to tDarts Club ID
  clubName: { type: String, required: true }, // Cached for display
  applicantUserId: { type: String, required: true }, // Reference to tDarts User ID
  applicantName: { type: String }, // Applicant's name from tDarts
  applicantEmail: { type: String }, // Applicant's email from tDarts
  status: { type: String, enum: ['submitted', 'approved', 'rejected', 'removal_requested'], default: 'submitted' },
  submittedAt: { type: Date, default: Date.now },
  notes: { type: String },
  removalType: { type: String, enum: ['delete_league', 'terminate_league'], default: 'delete_league' }, // For removals
}, { timestamps: true });

export const Application = models.Application || model('Application', ApplicationSchema);

// Config Model for dynamic settings/rules
const ConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export const Config = models.Config || model('Config', ConfigSchema);
