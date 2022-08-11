import Joi from 'joi';
import Result from 'rust-result';
import { validateSchema } from '../validation';
import { Inventory } from '../domain';

export type BookReservationRequest = {
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

export function validateBookingRequest(input: any) : Result<BookReservationRequest, string> {
  return validateSchema(bookReservationRequestSchema, input);
}

export type BookedReservation = {
  id: number;
  restaurantId : number;
  name : string;
  email: string;
  partySize: number;
  date: Date;
}

export function bookReservationFactory(
  findExistingReservations: (_args: BookReservationRequest) => Promise<BookedReservation[]>,
  findAvailableInventory: (_args: BookReservationRequest) => Promise<Inventory[]>,
  bookReservation: (inventoryId: number, _args: BookReservationRequest) => Promise<BookedReservation>,
) {
  return async (args: BookReservationRequest) : Promise<BookedReservation> => {
    const existingReservations = await findExistingReservations(args); 

    if (existingReservations.length > 0) {
      return Result.Ok(existingReservations[0]);
    }
    const availableInventory = await findAvailableInventory(args);

    if (availableInventory.length === 0) {
      return Result.Err(new Error(`There are no available reservations at this time`));
    }

    const slot = availableInventory[0];

    const bookedReservation = await bookReservation(slot.id, args);

    return Result.Ok(bookedReservation);
  };
}