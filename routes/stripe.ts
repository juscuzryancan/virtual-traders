import express from "express";
import { completeOrder } from "../db/orders.js";
import stripe from "stripe";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});
const apiRouter = express.Router();

apiRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    let event = request.body;
    let endpointSecret = "";
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"] as string;
      try {
        event = stripeInstance.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret,
        );
      } catch (error) {
        const { message }: any = error;
        console.log(`⚠️  Webhook signature verification failed.`, message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`,
        );
        console.log("payment", paymentIntent.metadata);
        // Then define and call a method to handle the successful payment intent.
        completeOrder({ id: event.data.metadata.orderId });

      case "payment_intent.succeeded":
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  },
);

apiRouter.post("/create-checkout-session", async (req, res) => {
  const {
    cart: { id: orderId, products },
    baseURL,
  } = req.body;

  const line_items = products.map(
    ({ name, description, quantity, price, imageURL }) => {
      return {
        price_data: {
          currency: "usd",
          unit_amount: price,
          product_data: {
            name,
            description,
            images: [imageURL],
          },
        },
        quantity,
      };
    },
  );

  const session = await stripeInstance.checkout.sessions.create({
    line_items,
    mode: "payment",
    success_url: `${baseURL}/orders/${orderId}?success=true`,
    cancel_url: `${baseURL}/orders/${orderId}?canceled=true`,
    metadata: {
      orderId,
    },
  });

  res.send({ URL: session.url });
});

export default apiRouter;
