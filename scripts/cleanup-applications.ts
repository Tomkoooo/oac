import mongoose from 'mongoose';
import { Application } from '../src/models';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not defined!');
  process.exit(1);
}

async function cleanupApplications() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    const db = mongoose.connection.useDb('oac_test');
    
    // Get the model on the correct database
    const ApplicationModel = db.model('Application', Application.schema);
    
    console.log('🔍 Listing all applications...');
    const allApps = await ApplicationModel.find({});
    console.log(`Found ${allApps.length} applications.`);
    
    allApps.forEach(app => {
      console.log(`- ID: ${app._id}, Club: ${app.clubName}, UserID: ${app.applicantUserId}, Status: ${app.status}`);
    });

    console.log('🧹 Deleting invalid applications...');
    const result = await ApplicationModel.deleteMany({ 
      $or: [
        { applicantUserId: 'unknown' },
        { applicantUserId: { $exists: false } },
        { applicantUserId: '' }
      ]
    });
    
    console.log(`✅ Deleted ${result.deletedCount} invalid applications.`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanupApplications();
