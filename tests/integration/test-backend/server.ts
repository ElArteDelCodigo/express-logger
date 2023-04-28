import express, { NextFunction, Request, Response } from 'express'
import { ExpressLogger, printLogo, printInfo, printRoutes } from '../../../src'
import path from 'path'
import router from './src/routes/application'

export const app = express()

ExpressLogger.initialize(app, {
  appName: 'test-backend',
  logPath: path.resolve(__dirname, './logs'),
})

const logger = ExpressLogger.getInstance()

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.trace(`${req.method} ${req.originalUrl}`)
  return next()
})

// eslint-disable-next-line
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  logger.info('ok')
  res.status(200).send('ok')
})

// api routes
app.use('/api', router)

// eslint-disable-next-line
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err)
  res.status(500).send('error')
})

printRoutes(app)
printLogo()
printInfo({
  name: 'test-backend',
  version: '1.0.0',
  env: 'development',
  port: '3333',
})

if (require.main === module) {
  app.listen(3333, () => {
    process.stdout.write(`App running on port ${3333}\n`)
  })
}

export default app
