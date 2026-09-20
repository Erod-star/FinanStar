import { Injectable } from '@nestjs/common';
import type { HealthResponse } from './app.controller';

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
