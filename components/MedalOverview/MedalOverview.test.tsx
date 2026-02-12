import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/tests/setup/test-utils'
import MedalOverview from './MedalOverview'
import { CountryMedals } from '@/lib/types'
import confetti from 'canvas-confetti'

jest.mock('canvas-confetti', () => {
  const mock = jest.fn()
  ;(mock as any).shapeFromPath = jest.fn(() => ({ type: 'path-shape' }))
  return mock
})

describe('MedalOverview Component', () => {
  const mockNedMedalsWithData: CountryMedals = {
    noc: 'NED',
    name: 'Netherlands',
    flag: '🇳🇱',
    rank: 1,
    medals: {
      gold: 3,
      silver: 2,
      bronze: 1,
      total: 6,
    },
  }

  const mockNedMedalsEmpty: CountryMedals = {
    noc: 'NED',
    name: 'Netherlands',
    flag: '🇳🇱',
    rank: 0,
    medals: {
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0,
    },
  }

  it('should render medal counts correctly', () => {
    const mockToggle = jest.fn()
    render(
      <MedalOverview
        nedMedals={mockNedMedalsWithData}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    expect(screen.getByText('3')).toBeInTheDocument() // Gold
    expect(screen.getByText('2')).toBeInTheDocument() // Silver
    expect(screen.getByText('1')).toBeInTheDocument() // Bronze
  })

  it('should display correct total medal count', () => {
    const mockToggle = jest.fn()
    render(
      <MedalOverview
        nedMedals={mockNedMedalsWithData}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    expect(screen.getByText('6')).toBeInTheDocument() // Total
    expect(screen.getByText(/Totaal medailles/i)).toBeInTheDocument()
  })

  it('should render medal type labels', () => {
    const mockToggle = jest.fn()
    render(
      <MedalOverview
        nedMedals={mockNedMedalsWithData}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    expect(screen.getByText('Goud')).toBeInTheDocument()
    expect(screen.getByText('Zilver')).toBeInTheDocument()
    expect(screen.getByText('Brons')).toBeInTheDocument()
  })

  it('should call onToggleTally when button is clicked', async () => {
    const user = userEvent.setup()
    const mockToggle = jest.fn()

    render(
      <MedalOverview
        nedMedals={mockNedMedalsWithData}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    const button = screen.getByRole('button', { name: /Bekijk medaillespiegel/i })
    await user.click(button)

    expect(mockToggle).toHaveBeenCalledTimes(1)
  })

  it('should show "Verberg" text when tally is shown', () => {
    const mockToggle = jest.fn()
    render(
      <MedalOverview
        nedMedals={mockNedMedalsWithData}
        onToggleTally={mockToggle}
        showTally={true}
      />
    )

    expect(screen.getByText(/Verberg medaillespiegel/i)).toBeInTheDocument()
  })

  it('should show "Bekijk" text when tally is hidden', () => {
    const mockToggle = jest.fn()
    render(
      <MedalOverview
        nedMedals={mockNedMedalsWithData}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    expect(screen.getByText(/Bekijk medaillespiegel/i)).toBeInTheDocument()
  })

  it('should display motivational message when no medals', () => {
    const mockToggle = jest.fn()
    render(
      <MedalOverview
        nedMedals={mockNedMedalsEmpty}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    expect(screen.getByText(/schaatsevementen zijn begonnen/i)).toBeInTheDocument()
  })

  it('should not display motivational message when medals exist', () => {
    const mockToggle = jest.fn()
    render(
      <MedalOverview
        nedMedals={mockNedMedalsWithData}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    expect(screen.queryByText(/schaatsevementen zijn begonnen/i)).not.toBeInTheDocument()
  })

  it('should calculate total correctly from individual medals', () => {
    const mockToggle = jest.fn()
    const customMedals: CountryMedals = {
      ...mockNedMedalsEmpty,
      medals: { gold: 5, silver: 3, bronze: 2, total: 10 },
    }

    render(
      <MedalOverview
        nedMedals={customMedals}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    // Component calculates total as gold + silver + bronze
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should show confetti when gold medal is clicked', async () => {
    const user = userEvent.setup()
    const mockToggle = jest.fn()

    render(
      <MedalOverview
        nedMedals={mockNedMedalsWithData}
        onToggleTally={mockToggle}
        showTally={false}
      />
    )

    const goldButton = screen.getByRole('button', { name: /Vier gouden medaille/i })
    await user.click(goldButton)

    expect(confetti).toHaveBeenCalled()
  })
})
