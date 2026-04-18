import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

/**
 * Create payment intent for resume generation
 * Amount should be in paise (₹10 = 1000 paise)
 */
export async function createPaymentIntent(
  userId,
  amount,
  description = "Resume Generation"
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in paise
      currency: "inr",
      metadata: {
        userId,
        description,
      },
      description: description,
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    };
  } catch (error) {
    console.error("Stripe Payment Intent Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Retrieve payment intent details
 */
export async function getPaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
      },
    };
  } catch (error) {
    console.error("Stripe Retrieve Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Confirm payment (server-side confirmation)
 */
export async function confirmPayment(paymentIntentId, paymentMethodId) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return {
      success: paymentIntent.status === "succeeded",
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      },
    };
  } catch (error) {
    console.error("Stripe Confirm Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create customer for recurring payments
 */
export async function createStripeCustomer(email, name, metadata = {}) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      success: true,
      customerId: customer.id,
    };
  } catch (error) {
    console.error("Stripe Customer Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Refund payment
 */
export async function refundPayment(paymentIntentId, amount = null) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount }), // Partial refund if amount specified
    });

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
    };
  } catch (error) {
    console.error("Stripe Refund Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Validate webhook signature
 */
export async function verifyWebhookSignature(body, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    return {
      verified: true,
      event,
    };
  } catch (error) {
    console.error("Webhook Signature Error:", error);
    return {
      verified: false,
      error: error.message,
    };
  }
}

/**
 * Handle payment succeeded webhook
 */
export function handlePaymentSucceeded(paymentIntent) {
  return {
    userId: paymentIntent.metadata.userId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    status: "COMPLETED",
  };
}

/**
 * Handle payment failed webhook
 */
export function handlePaymentFailed(paymentIntent) {
  return {
    userId: paymentIntent.metadata.userId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    status: "FAILED",
    error: paymentIntent.last_payment_error?.message,
  };
}

/**
 * Get pricing info
 */
export const PRICING = {
  RESUME_GENERATION: 1000, // ₹10 in paise
  JOB_BASED_RESUME: 1000,
  EDUCATION_BASED_RESUME: 500,
};
