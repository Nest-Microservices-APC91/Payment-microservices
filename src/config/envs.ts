/* eslint-disable prettier/prettier */
import { Logger } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  STRIPE_ENDPOINT_SECRET: string;
  SUCCESS_URL: string;
  CANCEL_URL: string;
}

const envsSchema = joi.object({
  PORT: joi.number().required().error(new Error('PORT IS REQUIRED')),
  STRIPE_SECRET: joi.string().required().error(new Error('STRIPE_SECRET IS REQUIRED')),
  STRIPE_ENDPOINT_SECRET: joi.string().required().error(new Error('STRIPE_ENDPOINT_SECRET IS REQUIRED')),
  SUCCESS_URL: joi.string().required().error(new Error('SUCCESS_URL IS REQUIRED')),
  CANCEL_URL: joi.string().required().error(new Error('CANCEL_URL IS REQUIRED')),
}).unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  //NATS_SERVERS: process.env.NATS_SERVERS?.split(','), //para asegurarse que NATS_SERVERS se un string[]
});

if (error) {
  Logger.error(`.ENV: ${error.message}` );
  throw new Error(error.message);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  stripeSecret: envVars.STRIPE_SECRET,
  stripeEndpointSecret: envVars.STRIPE_ENDPOINT_SECRET,
  success_url: envVars.SUCCESS_URL,
  cancel_url: envVars.CANCEL_URL,
};
