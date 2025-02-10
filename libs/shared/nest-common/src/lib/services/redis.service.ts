import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS } from '../../constants/redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS) private readonly redisClient: RedisClientType) {}

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      console.log("setting ttl");

      await this.redisClient.set(key, value, { PX: ttl * 1000 });
    } else {
      console.log("setting w/o ttl");
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
    const sessionKey = `session:user:${userId}:${sessionId}`;
    const userSessionsKey = `sessions:user:${userId}`;

    console.log("sessionKey", sessionKey);
    console.log("sessionData", sessionData);



    await this.set(sessionKey, JSON.stringify(sessionData), ttl);

    const existingSessions = await this.get(userSessionsKey);
    const sessions = existingSessions ? JSON.parse(existingSessions) : [];
    if (!sessions.includes(sessionId)) {
      sessions.push(sessionId);
      await this.set(userSessionsKey, JSON.stringify(sessions), ttl);
    }
  }

  // ➜ SUPPRIMER UNE SESSION UTILISATEUR
  async removeUserSession(userId: string, sessionId: string) {
    const sessionKey = `session:user:${userId}:${sessionId}`;
    const userSessionsKey = `sessions:user:${userId}`;

    await this.del(sessionKey);

    const existingSessions = await this.get(userSessionsKey);
    if (existingSessions) {
      const sessions = JSON.parse(existingSessions).filter((id: string)  => id !== sessionId);
      if (sessions.length > 0) {
        await this.set(userSessionsKey, JSON.stringify(sessions));
      } else {
        await this.del(userSessionsKey);
      }
    }
  }

  // ➜ RÉCUPÉRER TOUTES LES SESSIONS D'UN USER
  async getUserSessions(userId: string): Promise<any[]> {
    const userSessionsKey = `sessions:user:${userId}`;
    const sessionIds = await this.get(userSessionsKey);
    if (!sessionIds) return [];

    const sessions = await Promise.all(
      JSON.parse(sessionIds).map(async (sessionId: any) => {
        const sessionData = await this.get(`session:user:${userId}:${sessionId}`);
        return sessionData ? JSON.parse(sessionData) : null;
      })
    );

    return sessions.filter(session => session !== null);
  }
}
