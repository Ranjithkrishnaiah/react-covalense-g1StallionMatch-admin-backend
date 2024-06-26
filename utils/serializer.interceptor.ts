import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import memberResponseSerializer from 'src/members/member-response.serializer';
import { Member } from 'src/members/entities/member.entity';
import deepMapObject from './deep-map-object';

@Injectable()
export class SerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        return deepMapObject(data, (value) => {
          if (value.__entity === 'Member') {
            memberResponseSerializer(value as Member);
          }

          return value;
        });
      }),
    );
  }
}
