import { SeqTransport } from '@datalust/winston-seq';
import winston, { Logger, createLogger, transports } from 'winston';

export class LogSingleton {
  private static logger: Logger;

  public static create(): Logger {
    if (LogSingleton.logger) {
      return LogSingleton.logger;
    }

    LogSingleton.logger = createLogger({
      level: 'info',
      format: winston.format.combine(
        /* This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498 */
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { application: process.env.APP_NAME },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
        new SeqTransport({
          serverUrl: process.env.SEQ_URI,
          apiKey: process.env.SEQ_API_KEY,
          onError: (e) => {
            console.error(e);
          },
        }),
      ],
    });

    return LogSingleton.logger;
  }
}
