import { COLOR } from '../constants'
import { LoggerService } from '../core'
import { stdoutWrite } from '../tools'

export function printLoggerParams() {
  const opt = LoggerService.getLoggerParams()
  stdoutWrite(`\n${COLOR.LIGHT_GREY} ┌──────── Express Logger ──────── ...${COLOR.RESET}\n`)
  Object.keys(opt).forEach((property) => {
    stdoutWrite(
      ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String(property).padEnd(14)}` +
        `${COLOR.LIGHT_GREY}|${COLOR.RESET} ${COLOR.CYAN}${opt[property]}${COLOR.RESET}\n`,
    )
  })
  stdoutWrite(`${COLOR.LIGHT_GREY} └───────────────────────────────── ...${COLOR.RESET}\n`)
}
