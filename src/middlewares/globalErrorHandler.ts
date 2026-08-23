import type { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import { ZodError } from 'zod';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
} from '@prisma/client/runtime/client';
import { AppError } from '../errors/AppError';

interface PrismaErrorDetails {
  type: string;
  code?: string;
  meta?: unknown;
  details?: string;
}

const PRISMA_KNOWN_REQUEST_ERRORS: Record<
  string,
  { statusCode: number; message: string | ((meta: unknown) => string) }
> = {
  // P1xxx - Common/Connection Errors
  P1000: {
    statusCode: StatusCodes.UNAUTHORIZED,
    message:
      'Database authentication failed. Please check your database credentials.',
  },
  P1001: {
    statusCode: StatusCodes.SERVICE_UNAVAILABLE,
    message:
      'Cannot reach database server. Please ensure the database is running and accessible.',
  },
  P1002: {
    statusCode: StatusCodes.REQUEST_TIMEOUT,
    message: 'Database server connection timed out. Please try again.',
  },
  P1003: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Database does not exist. Please contact support.',
  },
  P1008: {
    statusCode: StatusCodes.REQUEST_TIMEOUT,
    message:
      'Operation timed out. Please try again or contact support if the issue persists.',
  },
  P1009: {
    statusCode: StatusCodes.CONFLICT,
    message: 'Database already exists.',
  },
  P1010: {
    statusCode: StatusCodes.FORBIDDEN,
    message: 'Access denied to the database. Please check your permissions.',
  },
  P1011: {
    statusCode: StatusCodes.SERVICE_UNAVAILABLE,
    message:
      'TLS connection error. Please check your database connection settings.',
  },
  P1012: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Invalid database schema configuration. Please check your Prisma schema.',
  },
  P1013: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Invalid database connection string. Please check your database URL.',
  },
  P1014: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'The underlying database table or view does not exist.',
  },
  P1015: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      "Your database version doesn't support the features used in your schema.",
  },
  P1016: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Incorrect number of parameters in your query. Please check your input.',
  },
  P1017: {
    statusCode: StatusCodes.SERVICE_UNAVAILABLE,
    message: 'Database connection was closed. Please try again.',
  },

  // P2xxx - Query Engine Errors
  P2000: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'The provided value is too long for the database field.',
  },
  P2001: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Record not found. The requested resource does not exist.',
  },
  P2002: {
    statusCode: StatusCodes.CONFLICT,
    message: (meta) =>
      `Duplicate entry. The ${(meta as { target?: string })?.target ?? 'field'} already exists.`,
  },
  P2003: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Invalid reference. The referenced record does not exist.',
  },
  P2004: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Database constraint violation occurred.',
  },
  P2005: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Invalid value stored in database field. Please contact support.',
  },
  P2006: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'The provided value is not valid for this field.',
  },
  P2007: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Data validation error. Please check your input values.',
  },
  P2008: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Failed to parse the query. Please check your request format.',
  },
  P2009: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Failed to validate the query. Please check your request parameters.',
  },
  P2010: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Raw query execution failed. Please contact support.',
  },
  P2011: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Required field is missing. Please provide all required information.',
  },
  P2012: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Missing required value. Please check your input data.',
  },
  P2013: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Missing required argument. Please provide all necessary fields.',
  },
  P2014: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Cannot delete record due to related data. Please remove related records first.',
  },
  P2015: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Related record not found. The referenced data does not exist.',
  },
  P2016: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Query interpretation error. Please check your request format.',
  },
  P2017: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Records are not properly connected. Please establish the required relationships.',
  },
  P2018: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Required connected records were not found.',
  },
  P2019: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Input error. Please check your data format.',
  },
  P2020: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Value is out of range for the specified type.',
  },
  P2021: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Database table does not exist. Please contact support.',
  },
  P2022: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Database column does not exist. Please contact support.',
  },
  P2023: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Inconsistent column data detected. Please contact support.',
  },
  P2024: {
    statusCode: StatusCodes.SERVICE_UNAVAILABLE,
    message: 'Database connection timeout. Please try again later.',
  },
  P2025: {
    statusCode: StatusCodes.NOT_FOUND,
    message:
      'Record not found. The operation failed because required records were not found.',
  },
  P2026: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'This feature is not supported by your current database provider.',
  },
  P2027: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Multiple database errors occurred during query execution.',
  },
  P2028: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Transaction API error occurred.',
  },
  P2029: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Query parameter limit exceeded. Please reduce the number of parameters.',
  },
  P2030: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Cannot find a fulltext index for the search. Please add @@fulltext to your schema.',
  },
  P2031: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'MongoDB server must be run as a replica set for transactions.',
  },
  P2033: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Number too large for 64-bit integer. Consider using BigInt.',
  },
  P2034: {
    statusCode: StatusCodes.CONFLICT,
    message: 'Transaction failed due to a conflict. Please try again.',
  },
  P2035: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Database assertion violation occurred.',
  },
  P2036: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'External connector error occurred.',
  },
  P2037: {
    statusCode: StatusCodes.SERVICE_UNAVAILABLE,
    message: 'Too many database connections opened. Please try again later.',
  },

  // P3xxx - Migration Errors
  P3000: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Failed to create database during migration.',
  },
  P3001: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Migration would cause destructive changes and possible data loss.',
  },
  P3002: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'The attempted migration was rolled back.',
  },
  P3003: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      'Migration format has changed. Saved migrations are no longer valid.',
  },
  P3004: {
    statusCode: StatusCodes.FORBIDDEN,
    message: 'Cannot migrate system database.',
  },
  P3005: {
    statusCode: StatusCodes.CONFLICT,
    message: 'Database schema is not empty. Cannot run initial migration.',
  },
  P3006: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Migration failed to apply to shadow database.',
  },
  P3007: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Preview features are not allowed in migrations.',
  },
  P3008: {
    statusCode: StatusCodes.CONFLICT,
    message: 'Migration is already recorded as applied.',
  },
  P3009: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      'Failed migrations found in database. New migrations cannot be applied.',
  },
  P3010: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Migration name is too long. Must be 200 characters or less.',
  },
  P3011: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Migration cannot be rolled back because it was never applied.',
  },
  P3012: {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      'Migration cannot be rolled back because it is not in a failed state.',
  },
  P3013: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Datasource provider arrays are no longer supported.',
  },
  P3014: {
    statusCode: StatusCodes.FORBIDDEN,
    message:
      'Could not create shadow database. Please check database permissions.',
  },
  P3015: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Migration file not found. Please restore the migration file.',
  },
  P3016: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Database reset fallback method failed.',
  },
  P3017: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Migration could not be found.',
  },
  P3018: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      'A migration failed to apply. Please resolve before applying new migrations.',
  },
  P3019: {
    statusCode: StatusCodes.CONFLICT,
    message: 'Datasource provider mismatch with migration lock file.',
  },
  P3020: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Shadow database creation is disabled on Azure SQL.',
  },
  P3021: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Foreign keys cannot be created on this database.',
  },
  P3022: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Direct DDL execution is disabled on this database.',
  },

  // P4xxx - Introspection Errors
  P4000: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Introspection operation failed to produce a schema file.',
  },
  P4001: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'The introspected database was empty.',
  },
  P4002: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'The introspected database schema was inconsistent.',
  },

  // P6xxx - Prisma Accelerate Errors
  P6000: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Prisma Accelerate server error occurred.',
  },
  P6001: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Invalid Prisma Accelerate data source URL.',
  },
  P6002: {
    statusCode: StatusCodes.UNAUTHORIZED,
    message: 'Invalid Prisma Accelerate API key.',
  },
  P6003: {
    statusCode: StatusCodes.PAYMENT_REQUIRED,
    message: 'Prisma Accelerate plan limit reached.',
  },
  P6004: {
    statusCode: StatusCodes.REQUEST_TIMEOUT,
    message: 'Prisma Accelerate query timeout exceeded.',
  },
  P6005: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Invalid parameters provided to Prisma Accelerate.',
  },
  P6006: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Prisma version not supported by Accelerate.',
  },
  P6008: {
    statusCode: StatusCodes.SERVICE_UNAVAILABLE,
    message: 'Prisma Accelerate engine failed to start.',
  },
  P6009: {
    statusCode: StatusCodes.REQUEST_TOO_LONG,
    message: 'Response size limit exceeded in Prisma Accelerate.',
  },
  P6010: {
    statusCode: StatusCodes.FORBIDDEN,
    message: 'Prisma Accelerate project is disabled.',
  },
  P6011: {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Too many requests to Prisma Accelerate. Please try again later.',
  },
};

const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // Express only treats a middleware as an error handler when it has 4 params.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong!';
  let errorDetails: PrismaErrorDetails | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = err.issues
      .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
      .join(', ');
    errorDetails = { type: 'ValidationError', details: message };
  } else if (err instanceof PrismaClientKnownRequestError) {
    const entry = PRISMA_KNOWN_REQUEST_ERRORS[err.code];
    if (entry) {
      statusCode = entry.statusCode;
      message =
        typeof entry.message === 'function'
          ? entry.message(err.meta)
          : entry.message;
    } else {
      statusCode = StatusCodes.BAD_REQUEST;
      message = `Database operation failed: ${err.message}`;
    }
    errorDetails = { type: 'DatabaseError', code: err.code, meta: err.meta };
  } else if (err instanceof PrismaClientValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid data provided. Please check your input and try again.';
    errorDetails = { type: 'ValidationError', details: err.message };
  } else if (err instanceof PrismaClientInitializationError) {
    statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    message = 'Database connection failed. Please try again later.';
    errorDetails = { type: 'DatabaseConnectionError', code: err.errorCode };
  } else if (err instanceof PrismaClientRustPanicError) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message =
      'Critical database engine error occurred. Please contact support.';
    errorDetails = { type: 'DatabaseEngineError', details: err.message };
  } else if (err instanceof PrismaClientUnknownRequestError) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message =
      'An unexpected database error occurred. Please try again or contact support.';
    errorDetails = { type: 'UnknownDatabaseError', details: err.message };
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Always log server-side, regardless of environment.
  // eslint-disable-next-line no-console
  console.error('Error:', err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: errorDetails,
      stack: err instanceof Error ? err.stack : undefined,
    }),
  });
};

export default globalErrorHandler;
