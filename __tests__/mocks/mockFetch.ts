import { OLYMPICS_MEDALS_URL, OLYMPICS_MEDALS_PAGE } from '@/lib/constants'
import { mockMedalData } from './handlers'

// Simple fetch mock that doesn't require MSW
export function setupFetchMock() {
  global.fetch = jest.fn((url: string | URL | Request) => {
    const urlString = url.toString()

    if (urlString.includes(OLYMPICS_MEDALS_URL)) {
      return Promise.resolve({
        ok: true,
        json: async () => mockMedalData,
      } as Response)
    }

    if (urlString.includes(OLYMPICS_MEDALS_PAGE)) {
      const htmlWithData = `
        <!DOCTYPE html>
        <html>
          <head><title>Olympics Medals</title></head>
          <body>
            <script id="__NEXT_DATA__" type="application/json">
              ${JSON.stringify({
                props: {
                  pageProps: {
                    initialMedals: mockMedalData,
                  },
                },
              })}
            </script>
          </body>
        </html>
      `
      return Promise.resolve({
        ok: true,
        text: async () => htmlWithData,
      } as Response)
    }

    return Promise.reject(new Error('Unhandled fetch: ' + urlString))
  }) as jest.Mock
}

export function teardownFetchMock() {
  ;(global.fetch as jest.Mock).mockClear()
}
