#!/usr/bin/env node

/**
 * Script to demonstrate file logging in production mode
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Set production environment
process.env.NODE_ENV = 'production';

// Simple file logging demo using pino directly
const pino = require('pino');

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino/file',
    options: {
      destination: path.join(logsDir, 'demo.log'),
    },
  },
});

console.log('📝 Testing file logging...');
console.log(`📁 Log file location: ${path.join(logsDir, 'demo.log')}`);

// Log some test messages
logger.info('Application started');
logger.info('User login', { userId: 123, email: 'test@example.com' });
logger.warn('Low memory warning', { memoryUsage: '85%' });
logger.error('Database connection failed', { error: 'Connection timeout' });

console.log('✅ File logging test completed!');
console.log('📄 Check the log file for entries:');
console.log(`   cat ${path.join(logsDir, 'demo.log')}`);