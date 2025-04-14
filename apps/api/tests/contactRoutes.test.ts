import express from 'express'
import request from 'supertest'
import contactRoutes from '../src/routes/contactRoutes'
import { ContactStatus } from '@prisma/client'

// Mock prisma
jest.mock('../src/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      contact: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      }
    }
  }
})

const prisma = jest.requireMock('../src/lib/prisma').default

describe('Contact Routes', () => {
  let app: express.Application

  beforeEach(() => {
    jest.clearAllMocks()
    app = express()
    app.use(express.json())
    app.use('/contacts', contactRoutes)
  })

  test('POST /contacts/subscribe - should create a new contact', async () => {
    // Setup mock responses
    prisma.contact.findUnique.mockResolvedValue(null)
    prisma.contact.create.mockResolvedValue({
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      status: ContactStatus.SUBSCRIBED,
      projectId: 'project-id'
    })

    const response = await request(app).post('/contacts/subscribe/').send({
      email: 'test@example.com',
      name: 'Test User',
      projectId: 'project-id'
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      message: 'Successfully subscribed',
      contact: {
        id: 'test-id',
        email: 'test@example.com',
        status: ContactStatus.SUBSCRIBED
      }
    })
  })

  test('GET /contacts/unsubscribe - should unsubscribe a contact', async () => {
    // Setup mock responses
    prisma.contact.findUnique.mockResolvedValue({
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      status: ContactStatus.SUBSCRIBED,
      projectId: 'project-id'
    })

    prisma.contact.update.mockResolvedValue({
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      status: ContactStatus.UNSUBSCRIBED,
      projectId: 'project-id'
    })

    const response = await request(app)
      .get('/contacts/unsubscribe')
      .query({ id: 'test-id' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: 'Successfully unsubscribed',
      contact: {
        id: 'test-id',
        email: 'test@example.com',
        status: ContactStatus.UNSUBSCRIBED
      }
    })
  })

  test('POST /contacts/generate-unsubscribe-url - should generate unsubscribe URL', async () => {
    // Setup mock response
    prisma.contact.findUnique.mockResolvedValue({
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      status: ContactStatus.SUBSCRIBED,
      projectId: 'project-id'
    })

    const response = await request(app)
      .post('/contacts/generate-unsubscribe-url')
      .send({ contactId: 'test-id' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      unsubscribeUrl: '/contacts/unsubscribe?id=test-id'
    })
  })
})
