import Result from 'rust-result';
import Joi from 'joi';
import { Controller, Get, Put } from '@overnightjs/core'
import { Request, Response } from 'express'
import Logger from '../logger';

import { PaginationParams, requestHandler, validateInput } from './requestHandling';

import { Inventory, Reservation } from '../models';

import { roundDateTime } from '../prelude';

import sequelize from '../sql';

type BookReservationRequest = {
  restaurantId : number;
  name : string;
  email: string;
  partySize: number;
  date: Date;
}

const bookReservationRequestSchema = Joi.object<BookReservationRequest>({
  restaurantId: Joi
    .number()
    .required(),

  name: Joi
    .string()
    .max(255)
    .required(),

  email: Joi
    .string() // should probably send verification email
    .max(255)
    .required(),

  partySize: Joi
    .number()
    .required(),

  date: Joi
    .date()
    .required(),
});

type BookedReservation = {
  id: number;
  restaurantId : number;
  name : string;
  email: string;
  partySize: number;
  date: Date;
}

import { QueryTypes } from 'sequelize';

async function bookReservation(args: BookReservationRequest) : Promise<BookedReservation> {
  try {
    return await sequelize.transaction(async () => {
      const existingReservations = await sequelize.query(`
        select
          r.id as id,
          i.restaurant_id as restaurantId, 
          r.name as name, 
          r.email as email,
          r.party_size as partySize,
          r.reserved_at as date
        from reservation r
        inner join inventory i
          on r.inventory_id = i.id
        where i.restaurant_id = $restaurantId
        and r.email = $email
        and r.party_size >= $partySize
        and r.reserved_at = $date
        limit 1
      `, {
        type: QueryTypes.SELECT,
        bind: {
          restaurantId: args.restaurantId,
          email: args.email,
          partySize: args.partySize,
          date: args.date,
        } 
      });

      if (existingReservations.length > 0) {
        return Result.Ok(existingReservations[0] as BookedReservation);
      }

      const date = roundDateTime(args.date, 15);

      const availableInventory = await sequelize.query(`
        select i.*
        from inventory i
        left join reservation r
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
          date,
        } 
      });

      if (availableInventory.length === 0) {
        return Result.Err(new Error(`There are no available reservations at this time`));
      }

      const slot = availableInventory[0];

      const bookedReservation : Reservation = await Reservation.create({
        inventory_id: slot.id,
        name: args.name,
        email: args.email,
        party_size: args.partySize,
        reserved_at: date,
      }) ;

      return Result.Ok({
        id: bookedReservation.id,
        restaurantId: slot.restaurant_id, 
        name: bookedReservation.name, 
        email: bookedReservation.email,
        partySize: bookedReservation.party_size,
        date: bookedReservation.reserved_at, 
      });
    });
  } catch (error) {
    Logger.error(error);
    return Result.Err(error);
    return Result.Err(new Error(`An unexpected error occurred while booking reservation`));
  }
}

const handleBookReservationRequest = requestHandler(
  (req: Request) => validateInput(bookReservationRequestSchema, req.body),
  async (args: BookReservationRequest) => {
    return bookReservation(args);
  });

@Controller('reservation')
export class ReservationController {
  @Put('')
  private async put(req: Request, res: Response) {
    return await handleBookReservationRequest(req, res);
  }
}

