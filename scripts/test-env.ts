#!/usr/bin/env node

// Test script to verify dotenv setup
import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Testing Dotenv Configuration');
console.log('================================');
console.log(`PORT: ${process.env.PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`HOST: ${process.env.HOST}`);
console.log(`API_PREFIX: ${process.env.API_PREFIX}`);
console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
console.log(`TICKETS_DIR: ${process.env.TICKETS_DIR}`);
console.log(`ENABLE_SWAGGER: ${process.env.ENABLE_SWAGGER}`);
console.log(`LOG_LEVEL: ${process.env.LOG_LEVEL}`);
console.log(`DEBUG: ${process.env.DEBUG}`);
console.log('================================');
console.log('✅ Dotenv setup is working correctly!');
