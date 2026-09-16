import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request } from "express";
import { ApiResponse } from "@restovyn/types";

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest<Request>();
    const requestId = (req as any).requestId || "unknown";

    return next.handle().pipe(
      map((data) => {
        // If the controller already returned an ApiResponse structure, pass it through
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          "requestId" in data
        ) {
          return data;
        }

        return {
          success: true,
          data: data !== undefined ? data : null,
          message: null,
          requestId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
