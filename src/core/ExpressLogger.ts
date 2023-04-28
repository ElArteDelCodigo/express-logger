import { LoggerService } from './LoggerService'
import { expressMiddleware } from 'cls-rtracer'
import { LoggerParams } from '../types'
import express from 'express'

export class ExpressLogger {
  static initialize(app: express.Express, options?: Partial<LoggerParams>) {
    LoggerService.initializeWithParams(options)
    app.use(expressMiddleware())
    app.use(LoggerService.getPinoInstance())
  }

  static getInstance() {
    return LoggerService.getInstance()
  }
}
