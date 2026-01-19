import Stripe from 'stripe';
import { SUBSCRIPTION_PRODUCTS } from '../shared/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export { stripe };

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(params: {
  email: string;
  name?: string;
  userId: string;
}): Promise<string> {
  // Check if customer already exists by email
  const existingCustomers = await stripe.customers.list({
    email: params.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]!.id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      userId: params.userId,
    },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for artist subscription
 */
export async function createSubscriptionCheckoutSession(params: {
  plan: 'basic' | 'premium';
  billingCycle: 'monthly' | 'annual';
  customerId: string;
  userEmail: string;
  userName?: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  // Get the product based on plan
  const product = params.plan === 'premium' 
    ? SUBSCRIPTION_PRODUCTS.ARTIST_PREMIUM 
    : SUBSCRIPTION_PRODUCTS.ARTIST_BASIC;

  // Get the price ID based on billing cycle
  const priceId = params.billingCycle === 'annual'
    ? product.stripePriceIdAnnual
    : product.stripePriceIdMonthly;

  if (!priceId) {
    throw new Error(`No price ID configured for ${params.plan} ${params.billingCycle}`);
  }

  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    client_reference_id: params.userId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: product.trialDays,
      metadata: {
        userId: params.userId,
        plan: params.plan,
        billingCycle: params.billingCycle,
      },
    },
    metadata: {
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName || '',
      plan: params.plan,
      billingCycle: params.billingCycle,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    allow_promotion_codes: true,
  });

  return session.url || '';
}

/**
 * Get subscription status from Stripe
 */
export async function getSubscriptionStatus(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return {
    status: subscription.status,
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
  };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return subscription;
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  return subscription;
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[Webhook] Checkout session completed:', session.id);
      return { success: true };
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('[Webhook] Subscription created:', subscription.id);
      return { success: true };
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('[Webhook] Subscription updated:', subscription.id);
      return { success: true };
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('[Webhook] Subscription deleted:', subscription.id);
      return { success: true };
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('[Webhook] Invoice paid:', invoice.id);
      return { success: true };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('[Webhook] Invoice payment failed:', invoice.id);
      return { success: true };
    }

    default:
      console.log('[Webhook] Unhandled event type:', event.type);
      return { success: true };
  }
}
