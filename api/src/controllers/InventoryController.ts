import Result from 'rust-result';
import Joi from 'joi';
import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'

import { PaginationParams, requestHandler, validateInput } from './requestHandling';

import { Inventory } from '../models';

import { roundDateTime } from '../prelude';

type ListInventoryRequest = { 
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


type CreateInventoryRequest = { 
  restaurantId: number;
  partySize: number;
  availableFrom: Date;
} & PaginationParams;

const createInventoryRequestSchema = Joi.object<CreateInventoryRequest>({
  restaurantId: Joi.number().required(),
  availableFrom: Joi.date().required(),
  partySize: Joi.number().required(),
});

async function createInventory(args: CreateInventoryRequest) : Promise<Inventory> {
  const res: Inventory = await Inventory.create({
    restaurant_id: args.restaurantId, 
    party_size: args.partySize, 
    available_at: roundDateTime(args.availableFrom, 15), 
  });

  return Result.Ok(res);
}

const handleCreateInventoryRequest = requestHandler(
  (req: Request) => validateInput(createInventoryRequestSchema, req.body),
  async (args: CreateInventoryRequest) => {
    return createInventory(args);
  });

import { Op } from 'sequelize';

const handleListInventoryRequest = requestHandler(
  (req: Request) => validateInput(listInventoryRequestSchema, req.query),
  async (args: ListInventoryRequest) => {
    const items = await Inventory.findAndCountAll({
      where: {
        restaurant_id: args.restaurantId,
        available_at: {
          [Op.lte]: args.availableFrom ?? new Date(),
        },
        ...args.availableUntil 
          ? {
            available_at: {
              [Op.lte]: args.availableUntil,
            },
          }
          : {},
      },
      offset: args.offset,
      limit: args.limit,
    });
    return Result.Ok(items);
  },
);

@Controller('inventory')
export class InventoryController {
  @Get('')
  private async get(req: Request, res: Response) {
    return await handleListInventoryRequest(req, res);
  }
  @Post('')
  private async post(req: Request, res: Response) {
    return await handleCreateInventoryRequest(req, res);
  }
}

