import express from 'express'
import request from 'supertest'
import emailRoutes from '../src/routes/emailRoutes'

// Mock the EmailService
jest.mock('../../src/services/emailService', () => {
  return {
    EmailService: jest.fn().mockImplementation(() => {
      return {
        sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
      }
    })
  }
})

describe('Email Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/email', emailRoutes)
  })

  test('POST /email/send - should send an email successfully', async () => {
    const response = await request(app).post('/email/send').send({
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      body: 'Test Body'
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: 'Email sent successfully',
      messageId: 'test-message-id'
    })
  })

  test('POST /email/send - should return 400 for missing fields', async () => {
    const response = await request(app).post('/email/send').send({
      from: 'test@example.com'
      // Missing 'to', 'subject', and 'body'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'Missing required fields',
      required: ['from', 'to', 'subject', 'body']
    })
  })
})
