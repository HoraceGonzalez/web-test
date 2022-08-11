import { QueryTypes } from 'sequelize';

import sequelize from './index';

import { Inventory, BookReservationRequest, BookedReservation } from '../domain';
import { 
  Restaurant as RestaurantSqlModel,
  Inventory as InventorySqlModel,
  Reservation as ReservationSqlModel,
} from '../models';

export async function findExistingReservations(args: BookReservationRequest) : Promise<BookedReservation[]> {
  const res : BookedReservation[] = await sequelize.query(`
    select
      r.id as id,
      i.restaurant_id as restaurantId, 
      r.name as name, 
      r.email as email,
      r.party_size as partySize,
      r.reserved_at as date
    from ${ReservationSqlModel.tableName} r
    inner join ${InventorySqlModel.tableName} i
      on r.inventory_id = i.id
    where i.restaurant_id = $restaurantId
    and r.email = $email
    and r.party_size >= $partySize
    and r.reserved_at = $date
  `, {
    type: QueryTypes.SELECT,
    bind: {
      restaurantId: args.restaurantId,
      email: args.email,
      partySize: args.partySize,
      date: args.date,
    } 
  });

  return res;
}

export async function findAvailableInventory(args: BookReservationRequest) : Promise<Inventory[]> {
  const res = await sequelize.query(`
    select i.*,
      res.name as restaurant_name,
      res.address as restaurant_address
    from ${InventorySqlModel.tableName} i
    inner join ${RestaurantSqlModel.tableName} res
      on i.restaurant_id = res.id
    left join ${ReservationSqlModel.tableName} r
      on r.inventory_id = i.id
    where i.restaurant_id = $restaurantId
    and i.party_size >= $partySize
    and r.id is null
    and i.available_at = $date
    limit 1
  `, {
    type: QueryTypes.SELECT,
    bind: {
      restaurantId: args.restaurantId,
      partySize: args.partySize,
      date: args.date,
    }, 
  });

  return res.map((r: any) => ({
    id: r.id,
    restaurant: {
      id: r.restaurant_id,
      name: r.restaurant_name,
      address: r.restaurant_address,
    },
    partySize: r.party_size,
    availableAt: r.available_at,
  }));
}

export async function bookReservation(inventoryId: number, args: BookReservationRequest) : Promise<BookedReservation> {
  const slot = await InventorySqlModel.findOne({
    where: {
      id: inventoryId, 
    },
  });

  const bookedReservation = await ReservationSqlModel.create({
    inventory_id: inventoryId,
    name: args.name,
    email: args.email,
    party_size: args.partySize,
    reserved_at: args.date,
  });

  return {
    id: bookedReservation.id,
    restaurantId: slot.restaurant_id, 
    name: bookedReservation.name, 
    email: bookedReservation.email,
    partySize: bookedReservation.party_size,
    date: bookedReservation.reserved_at, 
  };
}

export default sequelize;