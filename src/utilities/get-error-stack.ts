import { LoggerService } from '../core'

export function getErrorStack(originalErrorStack: string) {
  try {
    const opt = LoggerService.getLoggerParams()
    const projectPath = opt?.projectPath || process.cwd()
    const customErrorStack = originalErrorStack
      .split('\n')
      .map((line) => line.replace(new RegExp(projectPath, 'g'), '...'))
      .filter((line) => line.includes('.../'))
      .map((line) => (line.trim().startsWith('at') ? line.trim().split(' ').slice(2).join(' -> ') : line.trim()))
      .filter((line) => !!line)
      .join('\n')
      .trim()
    return customErrorStack ? `Error stack:\n${customErrorStack}` : ''
  } catch (err) {
    return originalErrorStack
  }
}
