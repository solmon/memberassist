import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const PHI_KEYS = new Set([
  'passwordHash',
  'ssn',
  'dateOfBirth',
  'phone',
  'email',
  'address',
  'tokenHash',
]);

function redactPhi(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactPhi);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = PHI_KEYS.has(k) ? '[REDACTED]' : redactPhi(v);
    }
    return result;
  }
  return value;
}

@Injectable()
export class PhiRedactionInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => redactPhi(data)));
  }
}
