import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { AdminUser } from "@/models";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        const admin = await AdminUser.findOne({ email: credentials.email });

        if (!admin) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, admin.password);

        if (!isValid) {
          return null;
        }

        return {
          id: admin._id.toString(),
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        // Check if user exists in AdminUser
        const admin = await AdminUser.findOne({ email: user.email });
        
        if (admin) {
          // If exists, allow and we will use this user in jwt/session
          user.id = admin._id.toString();
          (user as any).role = admin.role;
          return true;
        } else {
             // If not admin, you might want check a 'User' collection or allow creation?
             // For now, allow sign in but without 'role' or with default role
             // Or if this is strictly Admin portal: return false
             // Assuming explicit "OAC Admin" needs modifications, but OAC public might use login for Applications.
             // We'll return true to allow login, and maybe handle "No Role" in frontend
             return true; 
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
             await dbConnect();
             const admin = await AdminUser.findOne({ email: user.email });
             if (admin) {
                 token.role = admin.role;
                 token.id = admin._id.toString();
             } else {
                 token.role = 'user'; // Default role for new/non-admin google users
             }
        } else {
            token.role = (user as any).role;
            token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
};
