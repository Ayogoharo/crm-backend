/**
 * Global Jest setup for all tests
 * This file is run once before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Setup console overrides for test logging control
const originalConsole = global.console;

// Enable test logging control via environment variable
if (process.env.TEST_LOGGING !== 'true') {
  // Suppress noisy console output in tests unless explicitly enabled
  global.console = {
    ...originalConsole,
    // Keep error and warn for important test messages
    log: () => {},
    debug: () => {},
    info: () => {},
  };
}

// Global test timeout
jest.setTimeout(30000);

// Mock timers if needed for specific tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  // Restore original console
  global.console = originalConsole;
});
