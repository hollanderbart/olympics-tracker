import { OLYMPICS_MEDALS_URL, OLYMPICS_MEDALS_PAGE } from "../../../lib/constants"
import { mockMedalData } from "./handlers"

// Simple fetch mock that doesn't require MSW
export function setupFetchMock() {
  const jestGlobal = globalThis as typeof globalThis & {
    jest: { fn: <T extends (...args: any[]) => any>(fn: T) => T };
  };
  const mockFetch = jestGlobal.jest.fn((url: string | URL | Request) => {
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

    if (urlString.includes("/api/medal-chances")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response)
    }

    return Promise.reject(new Error("Unhandled fetch: " + urlString))
  });

  global.fetch = mockFetch as unknown as typeof global.fetch;
}

export function teardownFetchMock() {
  ;(global.fetch as unknown as { mockClear: () => void }).mockClear();
}
