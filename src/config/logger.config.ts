import { join } from 'path';

interface LogRequest {
  id?: string;
  method?: string;
  url?: string;
  headers?: {
    host?: string;
    'user-agent'?: string;
    'content-type'?: string;
  };
}

interface LogResponse {
  statusCode?: number;
  headers?: {
    'content-type'?: string;
  };
}

/**
 * Logging configuration for different environments
 */
export const getLoggerConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  // Base configuration
  const baseConfig = {
    level: isProduction ? 'info' : 'debug',
    serializers: {
      req: (req: LogRequest) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        headers: {
          host: req.headers?.host,
          'user-agent': req.headers?.['user-agent'],
          'content-type': req.headers?.['content-type'],
        },
      }),
      res: (res: LogResponse) => ({
        statusCode: res.statusCode,
        headers: {
          'content-type': res.headers?.['content-type'],
        },
      }),
    },
  };

  // Environment-specific configurations
  if (isDevelopment) {
    return {
      ...baseConfig,
      // Pretty console output for development (no file logging to avoid complexity)
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          translateTime: 'SYS:standard',
        },
      },
    };
  }

  if (isProduction) {
    return {
      ...baseConfig,
      // JSON file output for production
      transport: {
        target: 'pino/file',
        options: {
          destination: join(process.cwd(), 'logs', 'app.log'),
        },
      },
    };
  }

  if (isTest) {
    return {
      ...baseConfig,
      level: process.env.TEST_LOGGING === 'true' ? 'debug' : 'silent',
      transport:
        process.env.TEST_LOGGING === 'true'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: true,
                translateTime: 'SYS:HH:MM:ss',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    };
  }

  // Default: console only
  return baseConfig;
};
