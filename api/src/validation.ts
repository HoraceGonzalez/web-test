import Joi from 'joi';
import Result from 'rust-result';

export function validateSchema<TRequest>(schema: Joi.Schema<TRequest>, input: any) : Result<TRequest, string> {
  const res: Joi.ValidationResult<TRequest> = schema.validate(input);
  if (res.error) {
    return Result.Err(new Error(res.error.message));
  } else {
    return Result.Ok(res.value);
  }
}
