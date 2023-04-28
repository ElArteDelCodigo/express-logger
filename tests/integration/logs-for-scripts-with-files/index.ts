import path from 'path'
import { cmd, delay } from '../funciones-comun'

export default async function testSuit() {
  await eliminarFicherosLog()

  await cmd(`ts-node ${path.resolve(__dirname, 'demo/script.ts')}`, __dirname)
}

async function eliminarFicherosLog() {
  await cmd(`rm -rf ${path.resolve(__dirname, 'demo/logs')}`, __dirname)
  await delay()
}

if (require.main === module) {
  testSuit()
}
