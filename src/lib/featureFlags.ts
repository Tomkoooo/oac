/**
 * Feature flags utility for the application.
 * Centralizes checks for various features based on environment variables.
 */

export const featureFlags = {
  isStripeEnabled: () => {
    return process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true';
  },
  
  isApplicationEnabled: () => {
    return process.env.NEXT_PUBLIC_ENABLE_APPLICATION === 'true';
  }
};
