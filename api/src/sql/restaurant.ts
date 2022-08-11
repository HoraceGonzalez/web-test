import { Restaurant, CreateRestaurantRequest, ListRestaurantsRequest, PagedList } from '../domain';
import { Restaurant as RestaurantSqlModel } from '../models';

export async function createRestaurant(args: CreateRestaurantRequest) : Promise<Restaurant> {
  const res = await RestaurantSqlModel.create({
    name: args.name,
    address: [
      args.addressLine1,
      ...args.addressLine2?.length > 0
        ? [args.addressLine2]
        : [],
      `${args.city}, ${args.state} ${args.zip}`
    ].join(', '),
  });

  return {
    id: res.id,
    name: res.name,
    address: res.address,
  };
}

export async function listRestaurants(args: ListRestaurantsRequest) : Promise<PagedList<Restaurant>> {
  const items = await RestaurantSqlModel.findAndCountAll({
    offset: args.offset,
    limit: args.limit,
  });

  return {
    rows: items.rows.map((r: RestaurantSqlModel) => ({
      id: r.id, 
      name: r.name, 
      address: r.address, 
    })),
    offset: args.offset,
    limit: items.count,
  };
}