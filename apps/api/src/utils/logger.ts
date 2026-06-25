type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMeta {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  env: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function getConfiguredLevel(): LogLevel {
  const level = process.env['LOG_LEVEL'] as LogLevel | undefined;
  return level && level in LOG_LEVELS ? level : 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] <= LOG_LEVELS[getConfiguredLevel()];
}

function formatEntry(level: LogLevel, message: string, meta?: LogMeta): string {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: process.env['NODE_ENV'] ?? 'development',
    ...meta,
  };

  if (meta?.['error'] instanceof Error) {
    entry['error'] = {
      name: meta['error'].name,
      message: meta['error'].message,
      stack: meta['error'].stack,
    };
  }

  return JSON.stringify(entry);
}

export const logger = {
  error(message: string, meta?: LogMeta): void {
    if (shouldLog('error')) {
      console.error(formatEntry('error', message, meta));
    }
  },

  warn(message: string, meta?: LogMeta): void {
    if (shouldLog('warn')) {
      console.warn(formatEntry('warn', message, meta));
    }
  },

  info(message: string, meta?: LogMeta): void {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.log(formatEntry('info', message, meta));
    }
  },

  debug(message: string, meta?: LogMeta): void {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(formatEntry('debug', message, meta));
    }
  },
};
