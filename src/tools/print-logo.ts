import { COLOR } from '../constants'
import { LoggerService } from '../logger.service'
import { stdoutWrite } from './util'

const logger = LoggerService.getInstance()

const DEFAULT_LOGO = `
  _____                              
 | ____|_  ___ __  _ __ ___  ___ ___ 
 |  _| \\ \\/ / '_ \\| '__/ _ \\/ __/ __|
 | |___ >  <| |_) | | |  __/\\__ \\__ \\
 |_____/_/\\_\\ .__/|_|  \\___||___/___/
            |_|                      

     Express Backend
  `

export const printLogo = async (logo = DEFAULT_LOGO) => {
  logger.trace('')
  const toPrint = logo.replace(/\n/g, `\n${COLOR.LIGHT_GREY}`)
  stdoutWrite(`${COLOR.LIGHT_GREY}${toPrint}${COLOR.RESET}\n`)
}
