<h1 align="center">Express Logger</h1>

<p align="center">
  <a href="https://github.com/ElArteDelCodigo/express-logger/releases">
    <img src="https://img.shields.io/github/v/release/ElArteDelCodigo/express-logger" alt="release">
  </a>
  <a href="https://github.com/ElArteDelCodigo/express-logger/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/ElArteDelCodigo/express-logger" alt="License: MIT" />
  </a>
</p>

Librería para generar logs para express con pino

## Instalación

```bash
npm install @elartedelcodigo/express-logger
```

## Ejemplo

```ts
import express, { NextFunction, Request, Response } from 'express'
import { initialize, printLogo, printInfo, getInstance } from '@elartedelcodigo/express-logger'

const app = express()
initialize(app, {
  appName: 'app-backend',
  logPath: './logs',
})

const logger = getInstance()

if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method.toLowerCase() === 'options') return next()
    logger.trace(`${req.method} ${req.originalUrl.split('?')[0]}`)
    return next()
  })
}

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      servicio: 'ACTIVO',
      entorno: process.env.NODE_ENV,
      fecha: Date.now(),
    })
  } catch (err) {
    next(err)
  }
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err)

  res.status(500).json({
    finalizado: false,
    error: 'Error interno',
  })
})

printLogo()
printInfo({
  name: 'app',
  version: '1.0.0',
  env: process.env.NODE_ENV,
  port: process.env.PORT,
})

app.listen(process.env.PORT, () => {
  process.stdout.write(`App running on port ${process.env.PORT}\n`)
})
```

## Opciones de configuración

| Opción        | Descripción                                                                    | Valor por defecto |
| ------------- | ------------------------------------------------------------------------------ | ----------------- |
| appName       | Nombre de la aplicación                                                        | 'app'             |
| logPath       | Ruta absoluta de la carpeta logs. Si esta vacio no se crearán los archvos.     | ''                |
| logLevel      |                                                                                | 'info'            |
| logSize       | Para los ficheros de logs es el tamaño máximo que estos pueden llegar a pesar. | '5M'              |
| logInterval   | Para los ficheros de logs es el intervalo de tiempo para rotar los ficheros.   | '1d'              |
| logCompress   | Para indicar si se comprimirá o no los ficheros de logs.                       | 'false'           |
| logHide       | Indica los campos que serán ofuscados al momento de guardar los logs.          | ''                |
| subFolderName | Subcarpeta que se utilizará para guardar los ficheros de logs                  | ''                |
