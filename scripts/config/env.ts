// Environment configuration for Totem
export interface TotemConfig {
  port: number;
  host: string;
  nodeEnv: string;
  apiPrefix: string;
  enableSwagger: boolean;
  corsOrigin: string;
  ticketsDir: string;
  configDir: string;
  frontendDist: string;
  logLevel: string;
  debug: boolean;
}

export function getConfig(): TotemConfig {
  return {
    port: parseInt(process.env.PORT || '7073', 10),
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || 'api',
    enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    ticketsDir: process.env.TICKETS_DIR || '.totem/tickets',
    configDir: process.env.CONFIG_DIR || '.totem',
    frontendDist: process.env.FRONTEND_DIST || 'frontend/dist',
    logLevel: process.env.LOG_LEVEL || 'info',
    debug: process.env.DEBUG === 'true'
  };
}

export const config = getConfig();
