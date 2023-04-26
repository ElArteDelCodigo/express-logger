import { LoggerService } from './logger.service'
import { LoggerParams } from './logger.config'
import { expressMiddleware } from 'cls-rtracer'
import { AppInfo } from './tools/print-info'
import * as tools from './tools'

export const initialize = (app: any, options?: LoggerParams) => {
  LoggerService.initializeWithParams({
    appName: options?.appName || 'app',
    logPath: options?.logPath || '',
    logLevel: options?.logLevel || 'info',
    logSize: options?.logSize || '5M',
    logInterval: options?.logInterval || '1d',
    logCompress: options?.logCompress || 'false',
    logHide: options?.logHide || '',
    subFolderName: options?.subFolderName || '',
  })
  app.use(expressMiddleware())
  app.use(LoggerService.getPinoInstance())
}

export const getInstance = () => {
  return LoggerService.getInstance()
}

export const printInfo = (appInfo: AppInfo) => {
  return tools.printInfo(appInfo)
}

export const printRoutes = (app: any) => {
  return tools.printRoutes(app)
}

export const printLogo = () => {
  return tools.printLogo()
}

export default {
  initialize,
  getInstance,
  printInfo,
  printRoutes,
  printLogo,
}
