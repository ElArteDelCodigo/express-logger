/* eslint-disable @typescript-eslint/no-explicit-any */
import { toJSON } from 'flatted'

export function cleanParamValue(value: any, deep = 0) {
  try {
    // Para evitar recursividad infinita
    if (deep > 5) return String(value)

    // START
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item) => cleanParamValue(item, deep + 1))
      }
      if (isAxiosResponse(value)) {
        return {
          data: value.data,
          status: value.status,
          statusText: value.statusText,
          // headers: '__HEADERS__',
          // config: '__CONFIG__',
        }
      }
      if (isAxiosRequest(value)) {
        return {
          path: value.path,
          method: value.method,
          host: value.host,
          protocol: value.protocol,
        }
      }
      if (isAxiosError(value)) {
        return {
          code: value.code,
          config: value.config,
          // request: '__REQUEST__',
          // response: '__RESPONSE__',
        }
      }
      return Object.keys(value).reduce((prev, curr) => {
        prev[curr] = cleanParamValue(value[curr], deep + 1)
        return prev
      }, {})
    }
    // END

    // Por seguridad se ofuscan los tokens
    if (typeof value === 'string' && value.indexOf('Bearer') > -1) {
      const regex = /(Bearer\s+)([^\s]+)/g
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return value.replace(regex, (match, p1, p2) => `${p1}*****`)
    }

    return value
  } catch (error) {
    try {
      return toJSON(value)
    } catch (e) {
      return [e.toString()]
    }
  }
}

function isAxiosResponse(data: any) {
  const result = Boolean(
    typeof data === 'object' &&
      typeof data.data !== 'undefined' &&
      typeof data.status !== 'undefined' &&
      typeof data.statusText !== 'undefined' &&
      typeof data.headers !== 'undefined' &&
      typeof data.config !== 'undefined',
  )
  return result
}

function isAxiosRequest(data: any) {
  const result = Boolean(
    typeof data === 'object' &&
      typeof data.path !== 'undefined' &&
      typeof data.method !== 'undefined' &&
      typeof data.host !== 'undefined' &&
      typeof data.protocol !== 'undefined' &&
      typeof data.res !== 'undefined',
  )
  return result
}

function isAxiosError(data: any) {
  return data instanceof Error && data.name === 'AxiosError'
}
