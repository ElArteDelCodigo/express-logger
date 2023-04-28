import { toJSON } from 'flatted'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanAxiosResponse(value: any, deep = 0) {
  try {
    // Para evitar recursividad infinita
    if (deep > 5) return String(value)

    JSON.stringify(value)
    return value
  } catch (error) {
    if (Array.isArray(value)) {
      return value.map((item) => cleanAxiosResponse(item, deep + 1))
    }
    if (isAxiosResponse(value)) {
      return {
        data: value.data,
        status: value.status,
        statusText: value.statusText,
        headers: value.headers,
        config: value.config,
      }
    }
    if (typeof value === 'object') {
      return Object.keys(value).reduce((prev, curr) => {
        prev[curr] = cleanAxiosResponse(value[curr], deep + 1)
        return prev
      }, {})
    }
    try {
      return toJSON(value)
    } catch (e) {
      return [e.toString()]
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAxiosResponse(data: any) {
  return Boolean(
    typeof data === 'object' &&
      typeof data.data !== 'undefined' &&
      typeof data.status !== 'undefined' &&
      typeof data.statusText !== 'undefined' &&
      typeof data.headers !== 'undefined' &&
      typeof data.config !== 'undefined',
  )
}
