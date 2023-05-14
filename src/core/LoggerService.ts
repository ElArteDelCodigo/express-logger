import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { pino } from 'pino'
import pinoHttp, { HttpLogger, Options } from 'pino-http'
import { inspect } from 'util'
import { COLOR, LOG_COLOR, LOG_LEVEL } from '../constants'
import fastRedact from 'fast-redact'
import { LoggerConfig } from './LoggerConfig'
import { LoggerParams } from '../types'
import * as rTracer from 'cls-rtracer'
import { printLoggerParams, stdoutWrite } from '../tools'
import { cleanParamValue, getContext } from '../utilities'

export class LoggerService {
  private static opt: LoggerParams | null = null
  private static instance: LoggerService | null = null
  private static pinoInstance: HttpLogger | null = null
  private static redact: fastRedact.redactFn | null = null

  static initializeWithParams(options: Partial<LoggerParams>): void {
    const opt: LoggerParams = {
      appName: options?.appName || 'app',
      logPath: options?.logPath || '',
      logLevel: options?.logLevel || 'info',
      logSize: options?.logSize || '5M',
      logInterval: options?.logInterval || '1d',
      logCompress: options?.logCompress || 'false',
      logHide: options?.logHide || '',
      subFolderName: options?.subFolderName || '',
      projectPath: options?.projectPath || process.cwd(),
    }

    if (LoggerService.pinoInstance) return
    const opts: Options = LoggerConfig.getPinoHttpConfig(opt)
    const stream: pino.DestinationStream = LoggerConfig.getStream(opt)
    LoggerService.pinoInstance = pinoHttp(opts, stream)
    LoggerService.redact = fastRedact(opts.redact as unknown)
    LoggerService.opt = opt
    printLoggerParams()
  }

  static getInstance(): LoggerService {
    if (LoggerService.instance) {
      return LoggerService.instance
    }
    const logger = new LoggerService()
    LoggerService.instance = logger
    return LoggerService.instance
  }

  static getPinoInstance(): HttpLogger | null {
    return LoggerService.pinoInstance
  }

  static getLoggerParams(): LoggerParams | null {
    return LoggerService.opt
  }

  error(...optionalParams: unknown[]): void {
    this.print(LOG_LEVEL.ERROR, ...optionalParams)
  }

  warn(...optionalParams: unknown[]): void {
    this.print(LOG_LEVEL.WARN, ...optionalParams)
  }

  info(...optionalParams: unknown[]): void {
    this.print(LOG_LEVEL.INFO, ...optionalParams)
  }

  debug(...optionalParams: unknown[]): void {
    this.print(LOG_LEVEL.DEBUG, ...optionalParams)
  }

  trace(...optionalParams: unknown[]): void {
    this.print(LOG_LEVEL.TRACE, ...optionalParams)
  }

  private print(level: LOG_LEVEL, ...optionalParams: unknown[]): void {
    try {
      const reqId = rTracer.id()
      const context = getContext()

      // CLEAN PARAMS
      optionalParams = optionalParams.map((data: unknown) => cleanParamValue(data))

      if (LoggerConfig.logLevelSelected.includes(level)) {
        optionalParams.map((param) => {
          if (LoggerService.pinoInstance) {
            LoggerService.pinoInstance.logger[level]({
              request: reqId ? { id: reqId } : undefined,
              context,
              msg: param,
            })
          }
        })
      }
      if (process.env.NODE_ENV === 'production') {
        return
      }

      const color = this.getColor(level)
      const time = dayjs().format('DD/MM/YYYY HH:mm:ss')
      const cTime = `${COLOR.RESET}[${time}]${COLOR.RESET}`
      const cLevel = `${color}${level.toUpperCase()}${COLOR.RESET}`
      const cContext = `${COLOR.RESET}(${context}):${COLOR.RESET}`

      stdoutWrite('\n')
      stdoutWrite(`${cTime} ${cLevel} ${cContext} ${color}`)
      optionalParams.map((data) => {
        try {
          if (data && data instanceof AxiosError) {
            data = data.toJSON()
          }
          data =
            data && typeof data === 'object' && !(data instanceof Error)
              ? JSON.parse(
                  LoggerService.redact
                    ? LoggerService.redact(JSON.parse(JSON.stringify(data)))
                    : JSON.parse(JSON.stringify(data)),
                )
              : data
        } catch (err) {
          // lo intentamos :)
        }
        const toPrint = typeof data === 'object' ? inspect(data, false, null, false) : String(data)
        stdoutWrite(`${color}${toPrint.replace(/\n/g, `\n${color}`)}\n`)
      })
      stdoutWrite(COLOR.RESET)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  private getColor(level: LOG_LEVEL): string {
    return LOG_COLOR[level]
  }
}
