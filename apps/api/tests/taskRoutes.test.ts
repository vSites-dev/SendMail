import express from 'express'
import request from 'supertest'
import taskRoutes from '../src/routes/taskRoutes'

// Mock the taskScheduler
jest.mock('../../src/index', () => {
  return {
    taskScheduler: {
      processScheduledTasks: jest.fn().mockResolvedValue(undefined)
    }
  }
})

describe('Task Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/tasks', taskRoutes)

    // Reset mock implementation
    jest
      .requireMock('../../src/index')
      .taskScheduler.processScheduledTasks.mockResolvedValue(undefined)
  })

  test('POST /tasks/process-due - should process due tasks successfully', async () => {
    const response = await request(app).post('/tasks/process-due').send({})

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: 'Task processing completed successfully'
    })
  })
})
