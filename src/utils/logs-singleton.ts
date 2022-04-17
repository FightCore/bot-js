import { Logger, createLogger, format, transports } from 'winston';

export class LogSingleton {
  private static logger: Logger;

  public static get(): Logger {
    if (LogSingleton.logger) {
      return LogSingleton.logger;
    }

    LogSingleton.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(function (info) {
          return `[${new Date().toISOString()}] [${info.level}]: ${JSON.stringify(info.message, null, 4)}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
      ],
    });

    return LogSingleton.logger;
  }
}
