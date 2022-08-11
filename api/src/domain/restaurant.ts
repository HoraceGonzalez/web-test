import Joi from 'joi';
import Result from 'rust-result';
import { validateSchema } from '../validation';
import { PaginationParams } from '.';

export type Restaurant = {
  id: number;
  name: string;
  address: string;
}

export type ListRestaurantsRequest = { } & PaginationParams;

const listRestaurantRequestSchema = Joi.object<ListRestaurantsRequest>({
  offset: Joi.number().default(0),
  limit: Joi.number().default(10),
});

export function validateListRestaurantRequest(input: any) : Result<ListRestaurantsRequest, string> {
  return validateSchema(listRestaurantRequestSchema, input);
}

export type CreateRestaurantRequest = {
  name : string;
  addressLine1 : string;
  addressLine2 : string | null;
  city : string;
  state : string;
  zip : string;
}

const createRestaurantRequestSchema = Joi.object<CreateRestaurantRequest>({
  name: Joi
    .string()
    .max(255)
    .required(),

  addressLine1: Joi
    .string()
    .max(255)
    .required(),

  addressLine2: Joi
    .string()
    .max(255),

  city: Joi
    .string()
    .max(255)
    .required(),

  state: Joi
    .string()
    .min(2)
    .max(2)
    .required(),

  zip: Joi
    .string()
    .min(5)
    .max(10)
    .required(),
});

export function validateCreateRestaurantRequest(input: any) : Result<CreateRestaurantRequest, string> {
  return validateSchema(createRestaurantRequestSchema, input);
}