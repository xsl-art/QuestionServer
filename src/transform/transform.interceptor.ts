import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface TransformResponse<T> {
  errno: number;
  data: T;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<TransformResponse<T>> {
    return next.handle().pipe(
      map((data: T) => {
        return {
          errno: 0,
          data,
        };
      }),
    );
  }
}
