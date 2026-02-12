import { fetchMedalTally, getDutchEvents } from './olympics'

describe('Olympics Data Fetching', () => {
  const makeResponse = ({
    ok = true,
    text = '',
    json,
  }: {
    ok?: boolean
    text?: string
    json?: unknown
  }) =>
    ({
      ok,
      text: async () => text,
      json: async () => (json ?? JSON.parse(text || '{}')),
    }) as Response

  const htmlWithMedalsTable = (payload: unknown) => `
    <html>
      <body>
        <script type="application/json">
          ${JSON.stringify(payload)}
        </script>
      </body>
    </html>
  `

  describe('fetchMedalTally', () => {
    it('should fetch and parse medal data from JSON endpoint', async () => {
      const result = await fetchMedalTally()

      expect(result.medals).toBeDefined()
      expect(result.medals.length).toBeGreaterThan(0)
      expect(result.nedMedals).toBeDefined()
      expect(result.lastUpdated).toBeDefined()
    })

    it('should return Netherlands medal data', async () => {
      const result = await fetchMedalTally()

      expect(result.nedMedals).toMatchObject({
        noc: 'NED',
        name: 'Netherlands',
        flag: '🇳🇱',
      })
      expect(result.nedMedals?.medals).toBeDefined()
    })

    it('should parse medal counts correctly', async () => {
      const result = await fetchMedalTally()

      // Based on our mock data
      const nedMedals = result.nedMedals
      expect(nedMedals?.medals.gold).toBe(3)
      expect(nedMedals?.medals.silver).toBe(2)
      expect(nedMedals?.medals.bronze).toBe(1)
      expect(nedMedals?.medals.total).toBe(6)
    })

    it('should parse olympics medalsTable format with organisation and medalsNumber', async () => {
      const payload = {
        medalStandings: {
          medalsTable: [
            {
              organisation: 'NOR',
              description: 'Norway',
              rank: 1,
              medalsNumber: [{ type: 'Total', gold: 7, silver: 2, bronze: 5, total: 14 }],
            },
            {
              organisation: 'NED',
              description: 'Netherlands',
              rank: 10,
              medalsNumber: [{ type: 'Total', gold: 1, silver: 3, bronze: 0, total: 4 }],
            },
          ],
        },
      }

      global.fetch = jest.fn((url: string | URL | Request) => {
        const value = url.toString()
        if (value.includes('/milano-cortina-2026/medals')) {
          return Promise.resolve({ ok: false } as Response)
        }
        if (value.includes('CIS_MedalNOCs')) {
          return Promise.resolve({
            ok: true,
            text: async () => JSON.stringify(payload),
          } as Response)
        }
        return Promise.resolve({ ok: false } as Response)
      }) as jest.Mock

      const result = await fetchMedalTally()
      expect(result.nedMedals?.noc).toBe('NED')
      expect(result.nedMedals?.medals).toEqual({ gold: 1, silver: 3, bronze: 0, total: 4 })
      expect(result.medals.some((m) => m.noc === 'NOR')).toBe(true)
    })

    it('should include multiple countries in medal data', async () => {
      const result = await fetchMedalTally()

      expect(result.medals.length).toBeGreaterThanOrEqual(4)

      const countries = result.medals.map((m) => m.noc)
      expect(countries).toContain('NED')
      expect(countries).toContain('USA')
      expect(countries).toContain('NOR')
      expect(countries).toContain('GER')
    })

    it('should handle API failure gracefully', async () => {
      // Mock fetch to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

      const result = await fetchMedalTally()

      expect(result.medals).toEqual([])
      expect(result.nedMedals).toMatchObject({
        noc: 'NED',
        name: 'Netherlands',
        medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
      })
      expect(result.error).toBeDefined()
    })

    it('should include timestamp', async () => {
      const result = await fetchMedalTally()

      expect(result.lastUpdated).toBeDefined()
      const timestamp = new Date(result.lastUpdated)
      expect(timestamp.getTime()).not.toBeNaN()
    })

    it('should parse country names correctly', async () => {
      const result = await fetchMedalTally()

      const usa = result.medals.find((m) => m.noc === 'USA')
      expect(usa?.name).toBe('United States')

      const ned = result.medals.find((m) => m.noc === 'NED')
      expect(ned?.name).toBe('Netherlands')
    })

    it('should assign correct flags to countries', async () => {
      const result = await fetchMedalTally()

      const ned = result.medals.find((m) => m.noc === 'NED')
      expect(ned?.flag).toBe('🇳🇱')

      const usa = result.medals.find((m) => m.noc === 'USA')
      expect(usa?.flag).toBe('🇺🇸')
    })

    it('should use medals page parse when it succeeds', async () => {
      const pagePayload = {
        medalStandings: {
          medalsTable: [
            {
              organisation: 'NED',
              description: 'Netherlands',
              rank: 1,
              medalsNumber: [{ type: 'Total', gold: 4, silver: 0, bronze: 0, total: 4 }],
            },
          ],
        },
      }

      global.fetch = jest.fn((url: string | URL | Request) => {
        const value = url.toString()
        if (value.includes('/milano-cortina-2026/medals')) {
          return Promise.resolve(makeResponse({ text: htmlWithMedalsTable(pagePayload) }))
        }
        return Promise.resolve(makeResponse({ ok: false }))
      }) as jest.Mock

      const result = await fetchMedalTally()
      expect(result.nedMedals?.medals.gold).toBe(4)
      expect(result.error).toBeUndefined()
    })

    it('should fallback to JSON endpoint when page parsing fails', async () => {
      const jsonPayload = {
        medalStandings: {
          medalsTable: [
            {
              organisation: 'NED',
              description: 'Netherlands',
              rank: 2,
              medalsNumber: [{ type: 'Total', gold: 2, silver: 1, bronze: 0, total: 3 }],
            },
          ],
        },
      }

      global.fetch = jest.fn((url: string | URL | Request) => {
        const value = url.toString()
        if (value.includes('/milano-cortina-2026/medals')) {
          return Promise.resolve(makeResponse({ ok: false }))
        }
        if (value.includes('CIS_MedalNOCs')) {
          return Promise.resolve(makeResponse({ text: JSON.stringify(jsonPayload) }))
        }
        return Promise.resolve(makeResponse({ ok: false }))
      }) as jest.Mock

      const result = await fetchMedalTally()
      expect(result.nedMedals?.medals).toEqual({ gold: 2, silver: 1, bronze: 0, total: 3 })
      expect(result.error).toBeUndefined()
    })

    it('should fallback to Wikipedia parse when page and JSON fail', async () => {
      const wikiHtml = `
        <table>
          <tr><td>1</td><td>Norway</td><td>3</td><td>0</td><td>0</td><td>3</td></tr>
          <tr><td>2</td><td>Netherlands</td><td>1</td><td>2</td><td>0</td><td>3</td></tr>
        </table>
      `

      global.fetch = jest.fn((url: string | URL | Request) => {
        const value = url.toString()
        if (value.includes('/milano-cortina-2026/medals')) {
          return Promise.resolve(makeResponse({ ok: false }))
        }
        if (value.includes('CIS_MedalNOCs')) {
          return Promise.resolve(makeResponse({ ok: false }))
        }
        if (value.includes('wikipedia.org/wiki/2026_Winter_Olympics_medal_table')) {
          return Promise.resolve(makeResponse({ text: wikiHtml }))
        }
        return Promise.resolve(makeResponse({ ok: false }))
      }) as jest.Mock

      const result = await fetchMedalTally()
      expect(result.nedMedals?.noc).toBe('NED')
      expect(result.nedMedals?.medals.total).toBe(3)
      expect(result.error).toBeUndefined()
    })

    it('should return empty fallback when all sources fail', async () => {
      global.fetch = jest.fn(() => Promise.resolve(makeResponse({ ok: false }))) as jest.Mock

      const result = await fetchMedalTally()
      expect(result.medals).toEqual([])
      expect(result.nedMedals?.medals).toEqual({ gold: 0, silver: 0, bronze: 0, total: 0 })
      expect(result.error).toBeDefined()
    })
  })

  describe('getDutchEvents', () => {
    it('should return list of Dutch events', async () => {
      const events = await getDutchEvents()

      expect(events).toBeDefined()
      expect(Array.isArray(events)).toBe(true)
      expect(events.length).toBeGreaterThan(0)
    })

    it('should include event status', async () => {
      const events = await getDutchEvents()

      events.forEach((event) => {
        expect(event.status).toBeDefined()
        expect(['upcoming', 'live', 'completed']).toContain(event.status)
      })
    })

    it('should include event details', async () => {
      const events = await getDutchEvents()

      const firstEvent = events[0]
      expect(firstEvent.id).toBeDefined()
      expect(firstEvent.sport).toBeDefined()
      expect(firstEvent.event).toBeDefined()
      expect(firstEvent.date).toBeDefined()
      expect(firstEvent.time).toBeDefined()
      expect(firstEvent.venue).toBeDefined()
      expect(firstEvent.athletes).toBeDefined()
      expect(Array.isArray(firstEvent.athletes)).toBe(true)
    })

    it('should include speed skating events', async () => {
      const events = await getDutchEvents()

      const speedSkatingEvents = events.filter((e) => e.sport === 'Speed Skating')
      expect(speedSkatingEvents.length).toBeGreaterThan(0)
    })

    it('should include short track events', async () => {
      const events = await getDutchEvents()

      const shortTrackEvents = events.filter((e) => e.sport === 'Short Track')
      expect(shortTrackEvents.length).toBeGreaterThan(0)
    })

    it('should compute event status based on date/time', async () => {
      const events = await getDutchEvents()

      // All events in 2026 should be upcoming (since we're testing in 2024/2025)
      const upcomingEvents = events.filter((e) => e.status === 'upcoming')
      expect(upcomingEvents.length).toBeGreaterThan(0)
    })

    it('should include athlete names', async () => {
      const events = await getDutchEvents()

      const eventWithAthletes = events.find((e) => e.athletes.length > 0)
      expect(eventWithAthletes).toBeDefined()
      expect(eventWithAthletes?.athletes[0]).toBeTruthy()
      expect(typeof eventWithAthletes?.athletes[0]).toBe('string')
    })

    it('should mark events source as fallback', async () => {
      const events = await getDutchEvents()
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].source).toBe('fallback')
    })

    it('should compute deterministic live/completed status with fixed clock', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2026-02-21T19:00:00+01:00'))

      const events = await getDutchEvents()
      const knownCompleted = events.find((e) => e.id === 'ssk-w3000')
      const knownLive = events.find((e) => e.id === 'ssk-mms')

      expect(knownCompleted?.status).toBe('completed')
      expect(knownLive?.status).toBe('live')

      jest.useRealTimers()
    })
  })
})
