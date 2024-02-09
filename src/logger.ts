import { config } from 'dotenv';
import { LoggerManager } from 'logging-library/lib/LoggerManager';

config();

export enum LogLevel {
  DEBUG = 'debug',
  ERROR = 'error',
  INFO = 'info',
  TRACE = 'trace',
  WARNING = 'warning',
}

export const REQUEST_ID = 'requestId';

export class ArchiveLogger extends LoggerManager {
  // to override the kafka configs, override the getKafkaConfig method
  public static getDefaultBlueprintIdentifier(): string {
    return 'web3-wrapper-default'; // default has no blueprint ID
  }
}
