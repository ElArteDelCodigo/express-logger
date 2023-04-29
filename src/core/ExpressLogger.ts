import { LoggerService } from './LoggerService'
import { expressMiddleware } from 'cls-rtracer'
import { LoggerParams } from '../types'
import { Express } from 'express'

export class ExpressLogger {
  static initialize(app: Express, options?: Partial<LoggerParams>) {
    LoggerService.initializeWithParams(options)
    app.use(expressMiddleware())
    app.use(LoggerService.getPinoInstance())
  }

  static getInstance() {
    return LoggerService.getInstance()
  }
}
