import { LoggerService } from './LoggerService'
import { expressMiddleware } from 'cls-rtracer'
import { ExpressLoggerParams } from '../types'
import express from 'express'

export class ExpressLogger {
  static initialize(app: express.Express, options?: ExpressLoggerParams) {
    LoggerService.initializeWithParams({
      appName: options?.appName || 'app',
      logPath: options?.logPath || '',
      logLevel: options?.logLevel || 'info',
      logSize: options?.logSize || '5M',
      logInterval: options?.logInterval || '1d',
      logCompress: options?.logCompress || 'false',
      logHide: options?.logHide || '',
      subFolderName: options?.subFolderName || '',
      projectPath: options?.projectPath || process.cwd(),
    })
    app.use(expressMiddleware())
    app.use(LoggerService.getPinoInstance())
  }

  static getInstance() {
    return LoggerService.getInstance()
  }
}
