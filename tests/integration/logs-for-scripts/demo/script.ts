import { LoggerService } from '../../../../src'

const logger = LoggerService.getInstance()

logger.info('info message')
logger.warn('warn message')
logger.error('error message')
