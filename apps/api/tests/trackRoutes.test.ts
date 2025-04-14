import express from 'express'
import request from 'supertest'
import trackRoutes from '../src/routes/track'

// Mock prisma
jest.mock('../src/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      click: {
        findUnique: jest.fn(),
        update: jest.fn()
      }
    }
  }
})

const prisma = jest.requireMock('../src/lib/prisma').default

describe('Track Routes', () => {
  let app: express.Application

  beforeEach(() => {
    jest.clearAllMocks()
    app = express()
    app.use('/track', trackRoutes)
  })

  test('GET /track/:id - should track a link click and redirect', async () => {
    // Setup mock responses
    const clickId = 'test-click-id'
    const targetUrl = 'https://example.com/target-page'

    prisma.click.findUnique.mockResolvedValue({
      id: clickId,
      link: targetUrl,
      status: 'PENDING'
    })

    prisma.click.update.mockResolvedValue({
      id: clickId,
      link: targetUrl,
      status: 'CLICKED'
    })

    const response = await request(app).get(`/track/${clickId}`).send()

    // Check that the click was found
    expect(prisma.click.findUnique).toHaveBeenCalledWith({
      where: { id: clickId }
    })

    // Check that the click was updated
    expect(prisma.click.update).toHaveBeenCalledWith({
      where: { id: clickId },
      data: { status: 'CLICKED' }
    })

    // Check redirection
    expect(response.status).toBe(302) // 302 is redirect status
    expect(response.header.location).toBe(targetUrl)
  })

  test('GET /track/:id - should return 404 if click not found', async () => {
    // Setup mock to return null for non-existent click
    prisma.click.findUnique.mockResolvedValue(null)

    const response = await request(app).get('/track/non-existent-id').send()

    // Check response
    expect(response.status).toBe(404)
    expect(response.text).toBe('Click not found')

    // The click update should not be called
    expect(prisma.click.update).not.toHaveBeenCalled()
  })
})
