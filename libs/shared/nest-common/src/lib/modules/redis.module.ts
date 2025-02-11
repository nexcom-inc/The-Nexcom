import { Logger, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { REDIS } from '../../constants/redis.constants';
import { RedisService } from '../services/redis.service';

@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async () => {
        const client = createClient({ url: process.env['REDIS_URI'] || 'redis://localhost:6379' });
        await client.connect();
        Logger.log('✅ Connected to Redis ⛁');
        return client;
      },
    },
    RedisService,
  ],
  exports: [REDIS, RedisService], // Exporte le client Redis et le service
})
export class RedisModule {}
