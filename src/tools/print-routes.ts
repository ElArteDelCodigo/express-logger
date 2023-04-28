import listEndpoints from 'express-list-endpoints'
import { COLOR } from '../constants'
import { LoggerService } from '../core'
import { stdoutWrite } from '../tools'
import express from 'express'

export function printRoutes(app: express.Express) {
  _printRoutes(app)
}

async function _printRoutes(mainRouter: express.Express) {
  const logger = LoggerService.getInstance()

  logger.info('Cargando aplicación...')
  stdoutWrite('\n')
  listEndpoints(mainRouter).forEach((route) => {
    route.methods.map((method) => {
      if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const cMethod = `${getColor(method)}${method.padEnd(7, ' ')}`
        const msg = `${COLOR.LIGHT_GREY} - ${cMethod}${COLOR.CYAN} ${route.path}`
        stdoutWrite(`${msg}\n`)
      }
    })
  })
  stdoutWrite(COLOR.RESET)
  stdoutWrite('\n')
}

function getColor(method: string) {
  if (method === 'GET') return COLOR.GREEN
  if (method === 'POST') return COLOR.YELLOW
  if (method === 'PUT') return COLOR.CYAN
  if (method === 'PATCH') return COLOR.CYAN
  if (method === 'DELETE') return COLOR.RED
  return COLOR.RESET
}
