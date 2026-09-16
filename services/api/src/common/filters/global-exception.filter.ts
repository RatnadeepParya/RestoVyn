import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiErrorResponse } from "@restovyn/types";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request as any).requestId || "unknown";
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message =
      "An unexpected internal error occurred. Please contact support.";
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resObj = exception.getResponse();
      if (typeof resObj === "string") {
        message = resObj;
      } else if (typeof resObj === "object" && resObj !== null) {
        const anyRes = resObj as any;
        message = anyRes.message || message;
        code = anyRes.error || exception.constructor.name.toUpperCase();
        details =
          anyRes.details ||
          (Array.isArray(anyRes.message) ? anyRes.message : undefined);
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
      if (process.env.NODE_ENV !== "production") {
        message = exception.message;
        details = exception.stack;
      }
    }

    const errorPayload: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message: Array.isArray(message) ? message.join(", ") : message,
        details,
      },
      requestId,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorPayload);
  }
}
