import { LoggerService } from '../core'

export function getContext(saltar = 4): string {
  try {
    const opt = LoggerService.getLoggerParams()
    const projectPath = opt?.projectPath || process.cwd()
    const originalStack = String(new Error().stack)
    const context = originalStack
      .split('\n')
      .slice(saltar)
      .map((line) => line.replace(new RegExp(projectPath, 'g'), '...'))
      .filter((line) => line.includes('.../'))
      .map((line) => line.split('/').pop()?.slice(0, -1))
      .shift()
    return context || '-'
  } catch (e) {
    return '-'
  }
}
