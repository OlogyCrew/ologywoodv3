/**
 * Stripe product and price configuration for Ologywood subscriptions
 * Live Stripe Price IDs configured for production
 */

export const SUBSCRIPTION_PRODUCTS = {
  ARTIST_BASIC: {
    name: "Ologywood Basic Plan",
    description: "Ideal for active artists and small booking teams. Includes advanced tools for managing multiple riders, handling more booking requests, and accessing priority support.",
    priceMonthly: 2900, // $29.00 in cents
    priceAnnual: 27800, // $278.00 in cents (20% savings)
    currency: "usd",
    interval: "month",
    trialDays: 7,
    stripePriceIdMonthly: "price_1Sr3cS7rYEOFZimTXMjud2xP",
    stripePriceIdAnnual: "price_1Sr3cS7rYEOFZimTzm0Dx9jm",
    stripeProductId: "prod_Toh0QfH3iydkxW",
    features: [
      "Unlimited artist profiles",
      "5 rider templates",
      "20 monthly booking requests",
      "Advanced contract management",
      "Full rider comparison tool access",
      "Standard analytics dashboard",
      "10 PDF exports per month",
      "Email support",
      "3 team members",
      "Basic custom branding",
      "Payment processing: 2.9% + $0.30",
    ],
  },
  ARTIST_PREMIUM: {
    name: "Ologywood Premium Plan",
    description: "The ultimate plan for professional artists, booking agencies, and venues. Unlimited access to all features, priority support, and advanced analytics to scale your booking business.",
    priceMonthly: 9900, // $99.00 in cents
    priceAnnual: 95000, // $950.00 in cents (20% savings)
    currency: "usd",
    interval: "month",
    trialDays: 7,
    stripePriceIdMonthly: "price_1Sr3dg7rYEOFZimT18MOpC59",
    stripePriceIdAnnual: "price_1Sr3g37rYEOFZimTAJVN3htK",
    stripeProductId: "prod_Toh1rof96s6RAB",
    features: [
      "Unlimited artist profiles",
      "Unlimited rider templates",
      "Unlimited monthly booking requests",
      "Full contract management suite",
      "Advanced analytics dashboard",
      "Unlimited PDF exports",
      "24/7 priority support",
      "Unlimited team members",
      "Full custom branding",
      "Full API access",
      "Payment processing: 2.5% + $0.30",
    ],
  },
} as const;

export type SubscriptionProductKey = keyof typeof SUBSCRIPTION_PRODUCTS;
