import path from 'path'
import { LoggerService, getContext, getErrorStack } from '../../../../src'

const logger = LoggerService.getInstance()

LoggerService.initializeWithParams({
  appName: 'demo',
  logPath: path.resolve(__dirname, './logs'),
})

logger.info('info message')
logger.warn('warn message')
logger.error('error message')

const err = new Error('ok')

logger.error('custom stack error = ', getErrorStack(String(err.stack)))

logger.debug('contexto actual con 1 salto  = ', getContext(1))
logger.debug('contexto actual con 2 saltos = ', getContext(2))
logger.debug('contexto actual con 3 saltos = ', getContext(3))
