import Joi from 'joi';
import { Request, Response } from 'express'

import Result from 'rust-result';

export type PaginationParams = {
  offset: number;
  limit: number;
};

export type ResponseEnvelope<TData, TError> = {
  success: boolean;
  data: TData | undefined;
  errors: TError[];
}

export function validateInput<TRequest>(schema: Joi.Schema<TRequest>, input: any) { //: Result<TRequest, string> {
  const res: Joi.ValidationResult<TRequest> = schema.validate(input);
  if (res.error) {
    return Result.Err(new Error(res.error.message));
  } else {
    return Result.Ok(res.value);
  }
}

export function requestHandler<TRequest, TSuccess>(validate, handler) {
  return async (req: Request, res: Response) => {
    const args : Result<TRequest, string> = validate(req);
    if (!Result.isOk(args)) {
      console.log({ args });
      const payload : ResponseEnvelope<TSuccess, string> = {
        success: false,
        data: undefined,
        errors: [Result.Err(args).message],
      };
      return res
        .status(406)
        .json(payload);
    } else {
      const data: Result<TSuccess, string> = await handler(Result.Ok(args));
      if (Result.isOk(data)) {
        const payload : ResponseEnvelope<TSuccess, string> = {
          success: true,
          data: Result.Ok(data),
          errors: [],
        };
        return res
          .status(200)
          .json(payload);
      } else {
        const payload : ResponseEnvelope<TSuccess, string> = {
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