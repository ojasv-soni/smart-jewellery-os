/**
 * Fetch wrapper with automatic retry logic and graceful error handling.
 * Useful for mobile networks and unstable connections.
 */

interface FetchOptions extends RequestInit {
  retries?: number
  retryDelay?: number
  timeout?: number
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 2,
    retryDelay = 500,
    timeout = 10000,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      // Retry on server errors (5xx) or network issues
      if (!response.ok && attempt < retries) {
        await delay(retryDelay * Math.pow(2, attempt)) // Exponential backoff
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on last attempt
      if (attempt < retries) {
        await delay(retryDelay * Math.pow(2, attempt))
        continue
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries')
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Parse error response from API and return user-friendly message.
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json()
    return data?.error || data?.message || `Error (${response.status})`
  } catch {
    return `Error (${response.status}): ${response.statusText}`
  }
}
