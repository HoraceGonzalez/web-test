import Result from 'rust-result';
import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { requestHandler } from './requestHandling';

import { CreateRestaurantRequest, ListRestaurantsRequest, validateCreateRestaurantRequest, validateListRestaurantRequest } from '../domain';

import { createRestaurant, listRestaurants } from '../sql';

const handleCreateRestaurantRequest = requestHandler(
  (req: Request) => validateCreateRestaurantRequest(req.body),
  async (args: CreateRestaurantRequest) => {
    const restaurant = await createRestaurant(args);
    return Result.Ok(restaurant);
  });

const handleListRestaurantRequest = requestHandler(
  (req: Request) => validateListRestaurantRequest(req.query),
  async (args: ListRestaurantsRequest) => {
    const items = await listRestaurants(args); 
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
