import Result from 'rust-result';
import { Controller, Put } from '@overnightjs/core'
import { Request, Response } from 'express'
import Logger from '../logger';

import { requestHandler } from './requestHandling';

import { roundDateTime } from '../prelude';

import { bookReservationFactory, BookReservationRequest, validateBookingRequest } from '../domain';

import sequelize, { bookReservation as bookReservationSql , findAvailableInventory, findExistingReservations } from '../sql';

// compose together a booking function with all of its dependencies/side-effects (ie. sql queryies)
const bookReservation = bookReservationFactory(
  findExistingReservations,
  findAvailableInventory,
  bookReservationSql,
); 

const handleBookReservationRequest = requestHandler(
  (req: Request) => validateBookingRequest(req.body),
  async (args: BookReservationRequest) => {
    try {
      return await sequelize.transaction(async () => {
        // if we're being RESTful, we should probably use a 201 here in cases where a reservation is created, along with setting the location header
        return bookReservation({
          ...args,
          date: roundDateTime(args.date, 15),
        });
      });
    } catch (error) {
      Logger.error(error);
      return Result.Err(new Error(`An unexpected error occurred while booking reservation`));
    }
  });

@Controller('reservation')
export class ReservationController {
  @Put('')
  private async put(req: Request, res: Response) {
    return await handleBookReservationRequest(req, res);
  }
}

