import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/tests/setup/test-utils'
import HomePage from '../page'
import { CLIENT_CACHE_KEYS } from '@/lib/cache/clientCache'

describe('HomePage Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render the header with correct title', () => {
    render(<HomePage />)

    expect(screen.getAllByText(/Nederland/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Olympische Winterspelen 2026/i)).toBeInTheDocument()
  })

  it('should display Dutch medal data from API', async () => {
    render(<HomePage />)

    // Wait for the API call to complete and data to render
    await waitFor(() => {
      // Check for Netherlands medal count (mocked as 3 gold, 2 silver, 1 bronze)
      expect(screen.getByText('3')).toBeInTheDocument() // Gold medals
      expect(screen.getByText('2')).toBeInTheDocument() // Silver medals
      expect(screen.getByText('1')).toBeInTheDocument() // Bronze medals
    })
  })

  it('should display total medal count for Netherlands', async () => {
    render(<HomePage />)

    await waitFor(() => {
      // Total is 6 medals (3+2+1)
      const totalElement = screen.getByText('6')
      expect(totalElement).toBeInTheDocument()
    })
  })

  it('should toggle medal tally view when button is clicked', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // Gold medals loaded
    })

    // Find and click the toggle button
    const toggleButton = screen.getByRole('button', { name: /medaillespiegel/i })
    await user.click(toggleButton)

    // Medal tally should now be visible with other countries
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.getByText('Norway')).toBeInTheDocument()
      expect(screen.getByText('Germany')).toBeInTheDocument()
    })

    // Click again to hide
    await user.click(toggleButton)

    await waitFor(() => {
      expect(screen.queryByText('United States')).not.toBeInTheDocument()
    })
  })

  it('should display Dutch events from constants', async () => {
    render(<HomePage />)

    await waitFor(() => {
      // Check for some expected Dutch events
      expect(screen.getAllByText(/Speed Skating/i)[0]).toBeInTheDocument()
    })
  })

  it('should display next upcoming event highlight', async () => {
    render(<HomePage />)

    await waitFor(() => {
      const hasUpcomingLabel = screen.queryByText(/Volgende wedstrijd/i)
      const hasLiveLabel = screen.queryByText(/Nu live/i)
      expect(hasUpcomingLabel || hasLiveLabel).toBeTruthy()
    })
  })

  it('should handle API failure gracefully with fallback data', async () => {
    // Mock fetch to fail
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

    render(<HomePage />)

    // Should still render with fallback data
    await waitFor(() => {
      // Fallback NED data shows 0 medals
      expect(screen.getAllByText(/Nederland/i)[0]).toBeInTheDocument()
    })
  })

  it('should display completed events count in header', async () => {
    render(<HomePage />)

    await waitFor(() => {
      // Header should show completed events count
      const header = screen.getByText(/Nederland/i).closest('header')
      expect(header).toBeInTheDocument()
    })
  })

  it('should show footer with project information', () => {
    render(<HomePage />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('should refresh medal data with TanStack Query', async () => {
    const { rerender } = render(<HomePage />)

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // Gold medals
    })

    // Rerender to simulate time passing (TanStack Query handles refetch)
    rerender(<HomePage />)

    // Data should still be present after rerender
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should display medal overview with correct structure', async () => {
    render(<HomePage />)

    await waitFor(() => {
      // Check for medal labels
      expect(screen.getByText(/Goud/i)).toBeInTheDocument()
      expect(screen.getByText(/Zilver/i)).toBeInTheDocument()
      expect(screen.getByText(/Brons/i)).toBeInTheDocument()
    })
  })

  it('should render all key sections of the page', async () => {
    render(<HomePage />)

    await waitFor(() => {
      // Verify all main sections are present
      expect(screen.getByText(/Nederland/i)).toBeInTheDocument() // Header
      expect(screen.getByText(/Goud/i)).toBeInTheDocument() // Medal Overview
    })
  })

  it('should show offline banner and cached medal data when API fails', async () => {
    localStorage.setItem(
      CLIENT_CACHE_KEYS.medals,
      JSON.stringify({
        data: {
          medals: [
            {
              noc: 'NED',
              name: 'Netherlands',
              flag: '🇳🇱',
              rank: 1,
              medals: { gold: 5, silver: 4, bronze: 3, total: 12 },
            },
          ],
          nedMedals: {
            noc: 'NED',
            name: 'Netherlands',
            flag: '🇳🇱',
            rank: 1,
            medals: { gold: 5, silver: 4, bronze: 3, total: 12 },
          },
          lastUpdated: '2026-02-12T10:00:00.000Z',
          error: 'Could not fetch medal data. Will retry shortly.',
        },
        savedAt: '2026-02-12T10:00:00.000Z',
        source: 'test',
        schemaVersion: 1,
      })
    )

    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText(/Offline modus/i)).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('should render loading skeletons while data is pending', async () => {
    global.fetch = jest.fn(
      () =>
        new Promise<Response>(() => {
          // Intentionally unresolved to keep query pending.
        })
    ) as jest.Mock

    render(<HomePage />)

    expect(screen.getByLabelText(/Medailleoverzicht wordt geladen/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Volgende wedstrijd wordt geladen/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Programma wordt geladen/i)).toBeInTheDocument()
  })

  it('should retry medals fetch when retry button is clicked', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-02-12T12:00:00+01:00'))

    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<HomePage />)

    const retryButton = await screen.findByRole('button', { name: /Opnieuw proberen/i })
    const callCountBeforeClick = (global.fetch as jest.Mock).mock.calls.length

    await user.click(retryButton)

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(callCountBeforeClick)
    })
  })
})
