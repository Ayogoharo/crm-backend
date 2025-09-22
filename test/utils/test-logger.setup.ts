import { LoggerModule } from 'nestjs-pino';

/**
 * Test logger configuration for Pino in test environments
 * - Silent mode by default (can be enabled with TEST_LOGGING=true)
 * - Simplified format for test readability
 * - No HTTP request logging to avoid noise
 */
export const TestLoggerModule = LoggerModule.forRoot({
  pinoHttp: {
    // Enable logging in tests only if TEST_LOGGING env var is set
    enabled: process.env.TEST_LOGGING === 'true',
    level: process.env.TEST_LOGGING === 'true' ? 'debug' : 'silent',
    transport:
      process.env.TEST_LOGGING === 'true'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:HH:MM:ss',
              ignore: 'pid,hostname,req,res,responseTime', // Simplify test output
            },
          }
        : undefined,
    // Minimal serializers for tests
    serializers: {
      req: () => undefined, // Disable request logging in tests
      res: () => undefined, // Disable response logging in tests
    },
  },
});

/**
 * Simple logger configuration for unit tests (no HTTP)
 */
export const UnitTestLoggerModule = LoggerModule.forRoot({
  pinoHttp: false, // Disable HTTP logging for unit tests
  forRoutes: [], // No routes for unit tests
});
