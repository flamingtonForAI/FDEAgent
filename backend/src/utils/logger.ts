import pino from 'pino';
import { config } from '../config/index.js';

export const logger = pino({
  level: config.server.nodeEnv === 'production' ? 'info' : 'debug',
  transport:
    config.server.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export type Logger = typeof logger;
