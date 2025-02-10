import { RedisStore } from 'connect-redis';
import { RedisService } from '../services/redis.service';

import  {SessionData} from 'express-session';


declare interface Serializer {
  parse(s: string): SessionData | Promise<SessionData>;
  stringify(s: SessionData): string;
}

interface RedisStoreOptions {
    client: any;
    prefix?: string;
    scanCount?: number;
    serializer?: Serializer;
    ttl?: number | {
        (sess: SessionData): number;
    };
    disableTTL?: boolean;
    disableTouch?: boolean;
}


export class CustomRedisStore extends RedisStore {
  private redisService: RedisService;

  constructor(options: RedisStoreOptions & { redisService: RedisService }) {
    super(options);
    this.redisService = options.redisService;
  }

  // Override de set() pour stocker les sessions + tracking
  override async set(sessionId: string, sessionData: any, callback: (err?: any) => void) {

    console.log("sessionData userId", sessionData.passport?.user?.id);





    const userId = sessionData.passport?.user?.id; // Récupérer l'ID utilisateur depuis la session
    const ttl = sessionData.cookie?.maxAge ? Math.floor(sessionData.cookie.maxAge / 1000) : 3600;

    super.set(sessionId, sessionData, async (err) => {
      if (err) return callback(err);

      if (userId) {
        try {
          console.log("userId", userId);

          await this.redisService.storeUserSession(userId, sessionId, sessionData, ttl);
        } catch (error) {
          console.error('Erreur lors de l’enregistrement de la session utilisateur:', error);
        }
      }

      callback();
    });
  }

  // Override de destroy() pour supprimer la session + tracking
  override async destroy(sessionId: string, callback: (err?: any) => void) {
    super.destroy(sessionId, async (err) => {
      if (err) return callback(err);

      try {
        // On cherche si cette session est liée à un utilisateur
        const keys = await this.redisService.get(`sessions:user:*`);
        if (keys) {
          const userIds = Object.keys(keys);
          for (const userId of userIds) {
            await this.redisService.removeUserSession(userId, sessionId);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la session utilisateur:', error);
      }

      callback();
    });
  }
}
