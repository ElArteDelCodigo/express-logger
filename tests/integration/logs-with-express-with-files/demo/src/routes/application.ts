import express, { NextFunction, Request, Response } from 'express'
import { ExpressLogger } from '../../../../../../src'

const router = express.Router()
const logger = ExpressLogger.getInstance()

// eslint-disable-next-line
router.get('/success/:logLevel', (req: Request, res: Response, next: NextFunction) => {
  logger[req.params.logLevel](`Mensaje de tipo ${req.params.logLevel}`)
  res.status(200).send('ok')
})

// eslint-disable-next-line
router.get('/error', (req: Request, res: Response, next: NextFunction) => {
  logger.error('[local] error from src/routes/application.ts')
  throw new Error('some error')
})

export default router
