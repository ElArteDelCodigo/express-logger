import path from 'path'
import { detenerServer, iniciarServer, peticion } from '../funciones-comun'

export default async function testSuit() {
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

if (require.main === module) {
  testSuit()
}
