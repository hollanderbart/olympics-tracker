import 'whatwg-fetch'
import '@testing-library/jest-dom'
import { setupFetchMock, teardownFetchMock } from './tests/setup/mocks/mockFetch'

// Setup fetch mock before all tests
beforeAll(() => {
  setupFetchMock()
})

// Reset fetch mock after each test
afterEach(() => {
  teardownFetchMock()
  setupFetchMock()
})

// Clean up after all tests
afterAll(() => {
  teardownFetchMock()
})
