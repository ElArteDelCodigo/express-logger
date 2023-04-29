export default async function init() {
  await (await import('./logs-for-scripts')).default()
  await (await import('./logs-for-scripts-with-files')).default()
  await (await import('./logs-with-express')).default()
  await (await import('./logs-with-express-with-files')).default()

  process.stdout.write('\n Pruebas concluidas correctamente :)\n\n')
}

if (require.main === module) {
  init()
}
