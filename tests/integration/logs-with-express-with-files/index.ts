import path from 'path'
import { cmd, delay, detenerServer, iniciarServer, peticion } from '../funciones-comun'

export default async function testSuit() {
  await eliminarFicherosLog()

  const { server } = await iniciarServer(path.resolve(__dirname, 'demo/server.ts'))

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

  if (server) {
    await detenerServer(server)
  }
}

async function eliminarFicherosLog() {
  await cmd(`rm -rf ${path.resolve(__dirname, 'demo/logs')}`, __dirname)
  await delay()
}

if (require.main === module) {
  testSuit()
}
