import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS, SESSION_TRACK_USER_SESSION_KEY_PREFIX } from '../../constants/redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS) private readonly redisClient: RedisClientType) {}

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {

      await this.redisClient.set(key, value, { PX: ttl * 1000 });
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  // ➜ STOCKER UNE SESSION UTILISATEUR
  async storeUserSession(userId: string, sessionId: string, sessionData: any, ttl: number) {
    const sessionKey = `${SESSION_TRACK_USER_SESSION_KEY_PREFIX}${userId}`;

    const data = {
      sessionId,
      ...sessionData,
    }


    await this.redisClient.lPush(sessionKey, JSON.stringify(data));
  }

  // ➜ SUPPRIMER UNE SESSION UTILISATEUR
  async removeUserSession(userId: string, sessionId: string) {
    const sessionKey = `${SESSION_TRACK_USER_SESSION_KEY_PREFIX}${userId}`;
    await this.del(sessionKey);

  }

  // ➜ RÉCUPÉRER TOUTES LES SESSIONS D'UN USER
  async getUserSessions(userId: string): Promise<any[]> {
    const userSessionsKey = `sessions:user:${userId}`;
    const sessionIds = await this.get(userSessionsKey);
    if (!sessionIds) return [];

    const sessions = await Promise.all(
      JSON.parse(sessionIds).map(async (sessionId: any) => {
        const sessionData = await this.get(`${SESSION_TRACK_USER_SESSION_KEY_PREFIX}${userId}`);
        return sessionData ? JSON.parse(sessionData) : null;
      })
    );

    return sessions.filter(session => session !== null);
  }
}
