import path from 'path'
import { cmd } from '../funciones-comun'

export default async function testSuit() {
  await cmd(`ts-node ${path.resolve(__dirname, 'demo/script.ts')}`, __dirname)
}

if (require.main === module) {
  testSuit()
}
