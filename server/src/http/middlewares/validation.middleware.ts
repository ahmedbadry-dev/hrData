import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { FieldError } from '../../shared/utils/api-response';
import { BadRequestException } from '../../shared/errors/BadRequestException';
import { $ZodIssue } from 'zod/v4/core';

export const formatValidationErrors = (errors: $ZodIssue[]): FieldError[] => {
  return errors.map((error) => {
    return { field: error.path.join(','), message: error.message };
  });
};

const createValidationMiddleware = (source: 'body' | 'query' | 'params' | 'all') => {
  return (schema: ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const dataToValidate =
        source === 'all'
          ? { body: req.body, query: req.query, params: req.params }
          : { [source]: req[source] };

      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errors: FieldError[] = formatValidationErrors(result.error.issues);
        throw new BadRequestException('Validation failed', errors);
      }

      if (source === 'all') {
        const data = result.data as {
          body: any;
          query: any;
          params: any;
        };
        Object.assign(req.body, data.body);
        Object.assign(req.query, data.query);
        Object.assign(req.params, data.params);
      } else {
        const data = result.data as Record<string, any>;
        Object.assign(req[source], data[source]);
      }

      next();
    };
  };
};

export const validateBodyMiddleware = createValidationMiddleware('body');
export const validateQueryMiddleware = createValidationMiddleware('query');
export const validateParamsMiddleware = createValidationMiddleware('params');
export const validateAllMiddleware = createValidationMiddleware('all');
