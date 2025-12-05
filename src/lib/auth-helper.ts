import { cookies } from 'next/headers';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Helper function to get session in NextAuth v5
 * Compatibility layer for getServerSession behavior
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token') || 
                        cookieStore.get('__Secure-next-auth.session-token');
    
    if (!sessionToken) {
      return null;
    }

    // In a real implementation, you'd verify the JWT token here
    // For now, we'll create a simple session check
    // This is a simplified version - in production, decode and verify the JWT
    return { user: { email: 'admin@oac.hu' } }; // Placeholder
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

/**
 * For compatibility with existing code using getServerSession
 */
export async function getServerSession() {
  return getSession();
}
