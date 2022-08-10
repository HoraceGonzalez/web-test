import Result from 'rust-result';
import Joi from 'joi';
import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'

import { PaginationParams, requestHandler, validateInput } from './requestHandling';

import { Restaurant } from '../models';

type ListRestaurantsRequest = { } & PaginationParams;

const listRestaurantRequestSchema = Joi.object<ListRestaurantsRequest>({
  offset: Joi.number().default(0),
  limit: Joi.number().default(10),
});

type CreateRestaurantRequest = {
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

async function createRestaurant(args:CreateRestaurantRequest) : Promise<Restaurant> {
  const res = await Restaurant.create({
    name: args.name,
    address: [
      args.addressLine1,
      ...args.addressLine2?.length > 0
        ? [args.addressLine2]
        : [],
      `${args.city}, ${args.state} ${args.zip}`
    ].join(', '),
  });

  return Result.Ok(res);
}

const handleCreateRestaurantRequest = requestHandler(
  (req: Request) => validateInput(createRestaurantRequestSchema, req.body),
  async (args: CreateRestaurantRequest) => {
    return createRestaurant(args);
  });

const handleListRestaurantRequest = requestHandler(
  (req: Request) => validateInput(listRestaurantRequestSchema, req.query),
  async (args: ListRestaurantsRequest) => {
    const items = await Restaurant.findAndCountAll({
      offset: args.offset,
      limit: args.limit,
    });
    return Result.Ok(items);
  },
);

@Controller('restaurant')
export class RestaurantController {
  @Get('')
  private async get(req: Request, res: Response) {
    return await handleListRestaurantRequest(req, res);
  }
  @Post('')
  private async post(req: Request, res: Response) {
    return await handleCreateRestaurantRequest(req, res);
  }
}
