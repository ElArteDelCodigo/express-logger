import { LoggerService } from '../core'

export function getErrorStack(originalErrorStack: string) {
  try {
    const opt = LoggerService.getLoggerParams()
    const projectPath = opt?.projectPath || process.cwd()
    const customErrorStack = originalErrorStack
      .split('\n')
      .map((line) => line.replace(new RegExp(projectPath, 'g'), '...'))
      .filter((line) => line.includes('.../'))
      .map((line) => line.substring(line.indexOf('.../'), line.length - 1))
      .join('\n')
      .trim()
    return customErrorStack || ''
  } catch (err) {
    return originalErrorStack
  }
}
