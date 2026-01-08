import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover', // Use latest or requested version
  typescript: true,
});

export const getStripePrice = () => {
  const price = parseInt(process.env.CLUB_APPLICATION_PRICE_NET || '0', 10);
  if (isNaN(price) || price <= 0) {
    throw new Error('Invalid CLUB_APPLICATION_PRICE_NET');
  }
  return price;
};
