import { fetchMedalTally, getDutchEvents } from './olympics'

describe('Olympics Data Fetching', () => {
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
  })

  describe('getDutchEvents', () => {
    it('should return list of Dutch events', () => {
      const events = getDutchEvents()

      expect(events).toBeDefined()
      expect(Array.isArray(events)).toBe(true)
      expect(events.length).toBeGreaterThan(0)
    })

    it('should include event status', () => {
      const events = getDutchEvents()

      events.forEach((event) => {
        expect(event.status).toBeDefined()
        expect(['upcoming', 'live', 'completed']).toContain(event.status)
      })
    })

    it('should include event details', () => {
      const events = getDutchEvents()

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

    it('should include speed skating events', () => {
      const events = getDutchEvents()

      const speedSkatingEvents = events.filter((e) => e.sport === 'Speed Skating')
      expect(speedSkatingEvents.length).toBeGreaterThan(0)
    })

    it('should include short track events', () => {
      const events = getDutchEvents()

      const shortTrackEvents = events.filter((e) => e.sport === 'Short Track')
      expect(shortTrackEvents.length).toBeGreaterThan(0)
    })

    it('should compute event status based on date/time', () => {
      const events = getDutchEvents()

      // All events in 2026 should be upcoming (since we're testing in 2024/2025)
      const upcomingEvents = events.filter((e) => e.status === 'upcoming')
      expect(upcomingEvents.length).toBeGreaterThan(0)
    })

    it('should include athlete names', () => {
      const events = getDutchEvents()

      const eventWithAthletes = events.find((e) => e.athletes.length > 0)
      expect(eventWithAthletes).toBeDefined()
      expect(eventWithAthletes?.athletes[0]).toBeTruthy()
      expect(typeof eventWithAthletes?.athletes[0]).toBe('string')
    })
  })
})
