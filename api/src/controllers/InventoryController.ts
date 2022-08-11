import Result from 'rust-result';
import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { CreateInventoryRequest, ListInventoryRequest, validateCreateInventoryRequest, validateListInventoryRequest } from '../domain';

import { requestHandler } from '../middleware';

import { roundDateTime } from '../prelude';
import { createInventory, listInventory } from '../sql';

const handleCreateInventoryRequest = requestHandler(
  (req: Request) => validateCreateInventoryRequest(req.body),
  async (args: CreateInventoryRequest) => {
    const inventory = await createInventory({
      ...args,
      availableFrom: roundDateTime(args.availableFrom, 15),
    });

    return Result.Ok(inventory);
  });

const handleListInventoryRequest = requestHandler(
  (req: Request) => validateListInventoryRequest(req.query),
  async (args: ListInventoryRequest) => {
    const items = await listInventory(args);
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

