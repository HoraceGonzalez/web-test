import { Request, Response } from 'express'

import Result from 'rust-result';

// A uniform JSON response envelope. success is true if everything went OK. Otherwise, there will be a list of errors.
export type ResponseEnvelope<TData, TError> = {
  success: boolean;
  data: TData | undefined;
  errors: TError[];
}

// this is cheesy. Should probably include an error code so the client can handle it appropriately
export type ResponseError = string;

// A function that translates a "Result" type (which can either be Ok or Error) into an HTTP response.
// It also performs a validation step on the request input.
// This simplifies some of the plumbing at the expense of ignoring the HTTP spec. Ie. it always returns 200 instead of 201 when appropriate  
// Note: this would probably be better if it were split into two separate middlewares: one for validation and one for handling the request.
// the validated input could be added to the express request object, but I thought going through the trouble of extending it would probably be overkill.
export function requestHandler<TInput, TSuccess>(
  validate: (_req: Request) => Promise<Result<TInput, ResponseError>>,
  handler: (_args:TInput) => Promise<Result<TSuccess, ResponseError>>,
) {
  return async (req: Request, res: Response) => {

    const args : Result<TInput, ResponseError> = validate(req);
    if (!Result.isOk(args)) {
      const payload : ResponseEnvelope<TSuccess, ResponseError> = {
        success: false,
        data: undefined,
        errors: [Result.Err(args).message],
      };
      return res
        .status(406)
        .json(payload);
    } else {
      const data: Result<TSuccess, ResponseError> = await handler(Result.Ok(args));
      if (Result.isOk(data)) {
        const payload : ResponseEnvelope<TSuccess, ResponseError> = {
          success: true,
          data: Result.Ok(data),
          errors: [],
        };
        return res
          .status(200)
          .json(payload);
      } else {
        const payload : ResponseEnvelope<TSuccess, ResponseError> = {
          success: false,
          data: undefined,
          errors: [Result.Err(data).message],
        };
        return res
          .status(406)
          .json(payload);

      }
    }

  }
}