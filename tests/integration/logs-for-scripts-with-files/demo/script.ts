import path from 'path'
import { LoggerService } from '../../../../src'

const logger = LoggerService.getInstance()

LoggerService.initializeWithParams({
  appName: 'demo',
  logPath: path.resolve(__dirname, './logs'),
})

logger.info('info message')
logger.warn('warn message')
logger.error('error message')
