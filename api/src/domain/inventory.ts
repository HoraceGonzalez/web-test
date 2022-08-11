import Joi from 'joi';
import Result from 'rust-result';
import { validateSchema } from '../validation';
import { PaginationParams, Restaurant } from '.';

export type Inventory = { 
  id: number;
  restaurant: Restaurant;
  partySize: number
  availableAt: Date
}

export type ListInventoryRequest = { 
  restaurantId: number;
  availableFrom?: Date;
  availableUntil?: Date;
} & PaginationParams;

const listInventoryRequestSchema = Joi.object<ListInventoryRequest>({
  restaurantId: Joi.number().required(),
  availableFrom: Joi.date(),
  availableUntil: Joi.date(),
  offset: Joi.number().default(0),
  limit: Joi.number().default(10),
});

export function validateListInventoryRequest(input: any) : Result<ListInventoryRequest, string> {
  return validateSchema(listInventoryRequestSchema, input);
}

export type CreateInventoryRequest = { 
  restaurantId: number;
  partySize: number;
  availableFrom: Date;
} & PaginationParams;

const createInventoryRequestSchema = Joi.object<CreateInventoryRequest>({
  restaurantId: Joi.number().required(),
  availableFrom: Joi.date().required(),
  partySize: Joi.number().required(),
});

export function validateCreateInventoryRequest(input: any) : Result<CreateInventoryRequest, string> {
  return validateSchema(createInventoryRequestSchema, input);
}