import * as rTracer from 'cls-rtracer'
import { GenReqId, Options, ReqId } from 'pino-http'
import pino, { Level, multistream } from 'pino'
import { IncomingMessage, ServerResponse } from 'http'
import { createStream, Options as RotateOptions } from 'rotating-file-stream'
import { Request, Response } from 'express'
import path from 'path'
import { LOG_LEVEL } from './constants'

export type LoggerParams = {
  appName?: string
  logPath?: string
  logLevel?: string
  logSize?: string
  logInterval?: string
  logCompress?: string
  logHide?: string
  subFolderName?: string
}

export class LoggerConfig {
  static logLevelSelected: Level[] = []

  static getStream(loggerParams: LoggerParams): pino.MultiStreamRes {
    const streamDisk: pino.StreamEntry[] = []
    if (loggerParams.logPath && loggerParams.logPath.length > 0) {
      const options: RotateOptions = {
        size: loggerParams.logSize || '5M',
        path: path.resolve(loggerParams.logPath, loggerParams.subFolderName, loggerParams.appName),
        interval: loggerParams.logInterval || '1d',
      }

      if (loggerParams.logCompress && loggerParams.logCompress === 'true') {
        options.compress = true
      }

      const levelSelected = loggerParams.logLevel || 'info'
      for (const levelKey of Object.keys(LOG_LEVEL)) {
        const level = LOG_LEVEL[levelKey]
        streamDisk.push({
          stream: createStream(`${level}.log`, options),
          level,
        })
        LoggerConfig.logLevelSelected.push(level)
        if (level === levelSelected) {
          break
        }
      }
    }
    const streamHttp: any[] = []
    return multistream([...streamDisk, ...streamHttp])
  }

  static getLoggerConfig(loggerParams: LoggerParams) {
    return {
      pinoHttp: this.getPinoHttpConfig(loggerParams),
    }
  }

  static customSuccessMessage(req: Request, res: Response) {
    return `Petición concluida - ${res.statusCode}`
  }

  static customErrorMessage(req: Request, res: Response) {
    return `Petición concluida - ${res.statusCode}`
  }

  static customLogLevel(req: IncomingMessage, res: ServerResponse, err: Error) {
    return LoggerConfig.getLogLevel(res.statusCode, err)
  }

  static getLogLevel(statusCode: number, err?: Error) {
    if (statusCode >= 200 && statusCode < 400) return 'info'
    if (statusCode >= 400 && statusCode < 500) return 'warn'
    if (statusCode >= 500) return 'error'
    if (err) return 'error'
    return 'info'
  }

  static redactOptions(loggerParams: LoggerParams) {
    return {
      paths: loggerParams.logHide ? loggerParams.logHide.split(' ') : [],
      censor: '*****',
    }
  }

  static genReqId: GenReqId = (req: Request) => {
    return rTracer.id() as ReqId
  }

  static getPinoHttpConfig(loggerParams: LoggerParams): Options {
    return {
      name: loggerParams.appName,
      genReqId: LoggerConfig.genReqId,
      serializers: {
        err: () => {
          return
        },
        req: (req) => {
          return {
            id: req.id,
            method: req.method,
            url: req.url ? req.url.split('?')[0] : undefined,
          }
        },
        res: (res) => {
          return { statusCode: res.statusCode }
        },
      },
      formatters: undefined,
      level: 'trace',
      timestamp: pino.stdTimeFunctions.isoTime,
      customLogLevel: this.customLogLevel,
      customSuccessMessage: this.customSuccessMessage,
      customErrorMessage: this.customErrorMessage,
      customAttributeKeys: {
        req: `request`,
        res: `response`,
        err: `error`,
        responseTime: `response time [ms]`,
      },
      redact: LoggerConfig.redactOptions(loggerParams),
    }
  }
}
