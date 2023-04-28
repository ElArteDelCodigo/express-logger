import http from 'http'
import path from 'path'
import express from 'express'
import { exec } from 'child_process'

let app: express.Express
let server: http.Server

async function testSuit() {
  await eliminarFicherosLog()

  await iniciarServer()

  await peticion('/')
  await peticion('/api/success/info')
  await peticion('/api/success/warn')
  await peticion('/api/success/error')
  try {
    await peticion('/api/error')
  } catch (err) {
    // no pasa nada
  }
  await peticion('/api/success/debug')
  await peticion('/api/success/trace')

  await detenerServer()

  process.stdout.write('\n Pruebas concluidas correctamente :)\n\n')
}

async function eliminarFicherosLog() {
  await cmd(`rm -rf ${path.resolve(__dirname, 'test-backend/logs')}`, __dirname)
  await delay()
}

async function cmd(command: string, executePath: string) {
  await new Promise((resolve, reject) => {
    process.stdout.write(`[cmd] ${command}\n`)
    exec(command, { cwd: executePath }, (error, stdout, stderr) => {
      if (error !== null) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
  await delay()
}

async function iniciarServer() {
  app = (await import('./test-backend/server')).default
  await delay()

  await new Promise((resolve) => {
    server = app.listen(3333, () => {
      resolve(1)
    })
  })
  await delay()
}

async function detenerServer() {
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err)
      resolve(1)
    })
  })
  await delay()
}

async function peticion(path: string) {
  await new Promise((resolve, reject) => {
    fetch(`http://localhost:3333${path}`)
      .then(() => {
        resolve(1)
      })
      .catch((err) => {
        reject(err)
      })
  })
  await delay()
}

async function delay(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

if (require.main === module) {
  testSuit()
}
