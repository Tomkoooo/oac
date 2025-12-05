import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminUser } from '../src/models';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not defined!');
  console.error('Please set MONGODB_URI in your .env or .env.local file');
  process.exit(1);
}

async function seedAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...', MONGODB_URI);
    // Connect to MongoDB without database in the URI
    await mongoose.connect(MONGODB_URI);
    
    // Explicitly use the oac_test database
    const db = mongoose.connection.useDb('oac_test');
    console.log('✅ Connected to MongoDB, using database: oac_test');

    const email = 'admin@oac.hu';
    const password = 'OAC2024Admin!';

    // Get the AdminUser model on the oac_test database
    const AdminUserModel = db.model('AdminUser', AdminUser.schema);

    // Check if admin already exists
    const existingAdmin = await AdminUserModel.findOne({ email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`📧 Email: ${email}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user in oac_test database
    const admin = await AdminUserModel.create({
      email,
      password: hashedPassword,
      role: 'superadmin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👑 Role: superadmin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change this password after first login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
