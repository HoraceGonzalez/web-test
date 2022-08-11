import { Op } from 'sequelize';

import { Inventory, CreateInventoryRequest, ListInventoryRequest, PagedList } from '../domain';
import { Restaurant as RestaurantSqlModel, Inventory as InventorySqlModel } from '../sql/models';

export async function createInventory(args: CreateInventoryRequest) : Promise<Inventory> {
  const res : InventorySqlModel = await InventorySqlModel.create({
    restaurant_id: args.restaurantId, 
    party_size: args.partySize, 
    available_at: args.availableFrom,
  });

  // I'm sure there's a better way to include the restaurant association on create, but I couldn't figure it out.
  // So doing this manually.
  const restaurant = await RestaurantSqlModel.findOne({ 
    where: {
      id: res.restaurant_id,
    },
  });

  return {
    id: res.id,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
    },
    partySize: res.party_size,
    availableAt: res.available_at, 
  };
}

export async function listInventory(args: ListInventoryRequest) : Promise<PagedList<Inventory>> {
  const items = await InventorySqlModel.findAndCountAll({
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
    include: [RestaurantSqlModel],
  });

  return {
    rows: items.rows.map((r) => ({
      id: r.id,
      restaurant: {
        id: r.restaurant.id,
        name: r.restaurant.name,
        address: r.restaurant.address,
      },
      partySize: r.party_size,
      availableAt: r.available_at,
    })),
    offset: args.offset,
    limit: items.count,
  };
}