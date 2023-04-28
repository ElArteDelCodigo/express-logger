import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { pino } from 'pino'
import pinoHttp, { HttpLogger, Options } from 'pino-http'
import { inspect } from 'util'
import { COLOR, LOG_COLOR, LOG_LEVEL } from '../constants'
import fastRedact from 'fast-redact'
import { LoggerConfig } from './LoggerConfig'
import { LoggerParams } from '../types'
import { toJSON } from 'flatted'
import { stdoutWrite } from '../tools/util'
import * as rTracer from 'cls-rtracer'

export class LoggerService {
  private static opt: LoggerParams | null = null
  private static instance: LoggerService | null = null
  private static pinoInstance: HttpLogger | null = null
  private static redact: fastRedact.redactFn

  static initializeWithParams(opt: LoggerParams) {
    if (LoggerService.pinoInstance) return
    const opts: Options = LoggerConfig.getPinoHttpConfig(opt)
    const stream: pino.DestinationStream = LoggerConfig.getStream(opt)
    LoggerService.pinoInstance = pinoHttp(opts, stream)
    LoggerService.redact = fastRedact(opts.redact as unknown)
    LoggerService.opt = opt

    stdoutWrite(`\n${COLOR.LIGHT_GREY} |----- Express Logger ------ ...${COLOR.RESET}\n`)
    Object.keys(opt).forEach((property) => {
      stdoutWrite(
        ` ${COLOR.LIGHT_GREY}|${COLOR.RESET} ${String(property).padEnd(14)}` +
          `${COLOR.LIGHT_GREY}|${COLOR.RESET} ${COLOR.CYAN}${opt[property]}${COLOR.RESET}\n`,
      )
    })
    stdoutWrite(`${COLOR.LIGHT_GREY} |--------------------------- ...${COLOR.RESET}\n`)
  }

  static getInstance() {
    if (LoggerService.instance) {
      return LoggerService.instance
    }
    const logger = new LoggerService()
    LoggerService.instance = logger
    return LoggerService.instance
  }

  static getPinoInstance() {
    return LoggerService.pinoInstance
  }

  private getContext(): string {
    try {
      const projectPath = LoggerService.opt.projectPath
      const originalStack = String(new Error().stack)
      const method = originalStack
        .split('\n')
        .slice(4)
        .map((line) => line.replace(new RegExp(projectPath, 'g'), '...'))
        .filter((line) => line.includes('.../'))
        .map((line) => line.split('/').pop()?.slice(0, -1))
        .shift()
      return method || '-'
    } catch (e) {
      return '-'
    }
  }

  error(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.ERROR, ...optionalParams)
  }

  warn(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.WARN, ...optionalParams)
  }

  info(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.INFO, ...optionalParams)
  }

  debug(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.DEBUG, ...optionalParams)
  }

  trace(...optionalParams: unknown[]) {
    this.print(LOG_LEVEL.TRACE, ...optionalParams)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static cleanAxiosResponse(value: any, deep = 0) {
    try {
      // Para evitar recursividad infinita
      if (deep > 5) return String(value)

      JSON.stringify(value)
      return value
    } catch (error) {
      if (Array.isArray(value)) {
        return value.map((item) => LoggerService.cleanAxiosResponse(item, deep + 1))
      }
      if (LoggerService.isAxiosResponse(value)) {
        return {
          data: value.data,
          status: value.status,
          statusText: value.statusText,
          headers: value.headers,
          config: value.config,
        }
      }
      if (typeof value === 'object') {
        return Object.keys(value).reduce((prev, curr) => {
          prev[curr] = LoggerService.cleanAxiosResponse(value[curr], deep + 1)
          return prev
        }, {})
      }
      try {
        return toJSON(value)
      } catch (e) {
        return [e.toString()]
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static isAxiosResponse(data: any) {
    return Boolean(
      typeof data === 'object' &&
        typeof data.data !== 'undefined' &&
        typeof data.status !== 'undefined' &&
        typeof data.statusText !== 'undefined' &&
        typeof data.headers !== 'undefined' &&
        typeof data.config !== 'undefined',
    )
  }

  private print(level: LOG_LEVEL, ...optionalParams: unknown[]) {
    try {
      const reqId = rTracer.id()
      const context = this.getContext()

      // CLEAN PARAMS
      optionalParams = optionalParams.map((data: unknown) => LoggerService.cleanAxiosResponse(data))

      if (LoggerConfig.logLevelSelected.includes(level)) {
        optionalParams.map((param) => {
          if (LoggerService.pinoInstance) {
            LoggerService.pinoInstance.logger[level]({ reqId, context, msg: param })
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
              ? JSON.parse(LoggerService.redact(JSON.parse(JSON.stringify(data))))
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

  private getColor(level: LOG_LEVEL) {
    return LOG_COLOR[level]
  }
}
