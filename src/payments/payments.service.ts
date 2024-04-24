import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from '../config';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(createPaymentSessionDto: CreatePaymentSessionDto) {
    const { currency, items, orderId } = createPaymentSessionDto;

    //Detalles de los productos
    const line_items = items.map(({ name, price, quantity }) => ({
      price_data: {
        currency,
        product_data: {
          name,
        },
        unit_amount: Math.round(price * 100), // 20 euros  2000/100 = 20.00, los 2 ultimos 0 en stripe son decimales
      },
      quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      // Colocar aqui ID de la ordern
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },

      line_items,
      mode: 'payment',
      success_url: envs.success_url,
      cancel_url: envs.cancel_url,
    });

    return session;
  }

  async stripeWebhook(req: Request, resp: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    const endpointSecret = envs.stripeEndpointSecret;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (error) {
      this.logger.error(error.message);
      resp.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        // TODO:  llamar al microservice
        console.log({ metadata: event.data.object.metadata });
        break;

      default:
        this.logger.warn(`Event ${event.type} not handled`);
    }

    return resp.status(200).json({ sig });
  }
}
