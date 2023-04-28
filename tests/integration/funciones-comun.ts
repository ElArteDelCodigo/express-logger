import { Express } from 'express'
import { Server } from 'http'
import { exec } from 'child_process'

export async function delay(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export async function cmd(command: string, executePath: string) {
  await new Promise((resolve, reject) => {
    process.stdout.write(`[cmd] ${command}\n`)
    exec(command, { cwd: executePath }, (error, stdout, stderr) => {
      process.stdout.write(`${stdout}\n`)
      if (error !== null) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
  await delay()
}

export async function iniciarServer(serverPath: string) {
  const app: Express = (await import(serverPath)).default
  let server: Server | null = null
  await delay()

  await new Promise((resolve) => {
    server = app.listen(3333, () => {
      resolve(1)
    })
  })
  await delay()
  return { app, server }
}

export async function detenerServer(server: Server) {
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err)
      resolve(1)
    })
  })
  await delay()
}

export async function peticion(path: string) {
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
