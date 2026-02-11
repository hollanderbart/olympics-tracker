import { screen } from '@testing-library/react'
import { render } from '@/tests/setup/test-utils'
import MedalTally from './MedalTally'
import { CountryMedals } from '@/lib/types'

describe('MedalTally Component', () => {
  const mockMedals: CountryMedals[] = [
    {
      noc: 'NED',
      name: 'Netherlands',
      flag: '🇳🇱',
      rank: 1,
      medals: { gold: 3, silver: 2, bronze: 1, total: 6 },
    },
    {
      noc: 'USA',
      name: 'United States',
      flag: '🇺🇸',
      rank: 2,
      medals: { gold: 2, silver: 3, bronze: 2, total: 7 },
    },
    {
      noc: 'NOR',
      name: 'Norway',
      flag: '🇳🇴',
      rank: 3,
      medals: { gold: 2, silver: 1, bronze: 3, total: 6 },
    },
    {
      noc: 'GER',
      name: 'Germany',
      flag: '🇩🇪',
      rank: 4,
      medals: { gold: 1, silver: 2, bronze: 2, total: 5 },
    },
  ]

  it('should render all countries in the medal tally', () => {
    render(<MedalTally medals={mockMedals} />)

    expect(screen.getByText('Netherlands')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('Norway')).toBeInTheDocument()
    expect(screen.getByText('Germany')).toBeInTheDocument()
  })

  it('should display header row with column labels', () => {
    render(<MedalTally medals={mockMedals} />)

    expect(screen.getByText('Land')).toBeInTheDocument()
    expect(screen.getByText('Tot')).toBeInTheDocument()
    expect(screen.getByText('🥇')).toBeInTheDocument()
    expect(screen.getByText('🥈')).toBeInTheDocument()
    expect(screen.getByText('🥉')).toBeInTheDocument()
  })

  it('should sort countries by gold medals first', () => {
    render(<MedalTally medals={mockMedals} />)

    const rows = screen.getAllByRole('generic').filter((el) =>
      el.className.includes('tally-row')
    )

    // Netherlands should be first (3 gold)
    expect(rows[0]).toHaveTextContent('Netherlands')
    // USA and Norway both have 2 gold, USA has more silver so comes second
    expect(rows[1]).toHaveTextContent('United States')
    expect(rows[2]).toHaveTextContent('Norway')
    expect(rows[3]).toHaveTextContent('Germany')
  })

  it('should highlight Netherlands row', () => {
    render(<MedalTally medals={mockMedals} />)

    const nedRow = screen.getByText('Netherlands').closest('.tally-row')
    expect(nedRow).toHaveClass('is-ned')
  })

  it('should display correct medal counts for each country', () => {
    render(<MedalTally medals={mockMedals} />)

    // Check Netherlands medals
    const nedRow = screen.getByText('Netherlands').closest('.tally-row')
    expect(nedRow).toHaveTextContent('3') // Gold
    expect(nedRow).toHaveTextContent('2') // Silver
    expect(nedRow).toHaveTextContent('1') // Bronze
    expect(nedRow).toHaveTextContent('6') // Total
  })

  it('should show empty state when no medals', () => {
    render(<MedalTally medals={[]} />)

    expect(screen.getByText(/Nog geen medailles uitgereikt/i)).toBeInTheDocument()
  })

  it('should include NED even with 0 medals', () => {
    const medalsWithoutNED: CountryMedals[] = [
      {
        noc: 'NED',
        name: 'Netherlands',
        flag: '🇳🇱',
        rank: 0,
        medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
      },
      {
        noc: 'USA',
        name: 'United States',
        flag: '🇺🇸',
        rank: 1,
        medals: { gold: 2, silver: 1, bronze: 1, total: 4 },
      },
    ]

    render(<MedalTally medals={medalsWithoutNED} />)

    expect(screen.getByText('Netherlands')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
  })

  it('should filter out countries with 0 medals (except NED)', () => {
    const medalsWithZeros: CountryMedals[] = [
      ...mockMedals,
      {
        noc: 'FRA',
        name: 'France',
        flag: '🇫🇷',
        rank: 0,
        medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
      },
    ]

    render(<MedalTally medals={medalsWithZeros} />)

    expect(screen.queryByText('France')).not.toBeInTheDocument()
    expect(screen.getByText('Netherlands')).toBeInTheDocument()
  })

  it('should display rank numbers correctly', () => {
    render(<MedalTally medals={mockMedals} />)

    // Ranks are assigned as 1, 2, 3, 4 after sorting
    const rows = screen.getAllByRole('generic').filter((el) =>
      el.className.includes('tally-row')
    )

    expect(rows[0]).toHaveTextContent('1')
    expect(rows[1]).toHaveTextContent('2')
    expect(rows[2]).toHaveTextContent('3')
    expect(rows[3]).toHaveTextContent('4')
  })

  it('should display country flags', () => {
    render(<MedalTally medals={mockMedals} />)

    expect(screen.getByText('🇳🇱')).toBeInTheDocument()
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('🇳🇴')).toBeInTheDocument()
    expect(screen.getByText('🇩🇪')).toBeInTheDocument()
  })

  it('should sort by silver when gold is tied', () => {
    const tiedGoldMedals: CountryMedals[] = [
      {
        noc: 'USA',
        name: 'United States',
        flag: '🇺🇸',
        rank: 1,
        medals: { gold: 2, silver: 3, bronze: 1, total: 6 },
      },
      {
        noc: 'NOR',
        name: 'Norway',
        flag: '🇳🇴',
        rank: 2,
        medals: { gold: 2, silver: 1, bronze: 2, total: 5 },
      },
    ]

    render(<MedalTally medals={tiedGoldMedals} />)

    const rows = screen.getAllByRole('generic').filter((el) =>
      el.className.includes('tally-row')
    )

    // USA should be first (same gold, but more silver)
    expect(rows[0]).toHaveTextContent('United States')
    expect(rows[1]).toHaveTextContent('Norway')
  })
})
