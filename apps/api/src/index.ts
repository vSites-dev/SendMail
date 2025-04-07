import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import prisma from './lib/prisma'
import emailRoutes from './routes/emailRoutes'
import taskRoutes from './routes/taskRoutes'
import domainRoutes from './routes/domainRoutes'
import { TaskScheduler } from './services/tasks/taskScheduler'
import contactRoutes from './routes/contactRoutes'
import imageRoutes from './routes/imageRoutes'
import seedDatabase from './lib/seed'

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

// SERVING UPLOADED IMAGES
const uploadsPath = path.join(__dirname, '../uploads')
app.use('/images', express.static(uploadsPath))

// Routes
app.use('/email', emailRoutes)
app.use('/tasks', taskRoutes)
app.use('/domains', domainRoutes)
app.use('/contacts', contactRoutes)
app.use('/images', imageRoutes)

app.get('/seed/:userId', async (req, res) => {
  await seedDatabase({ userId: req.params.userId })
  res.json({ message: 'Database seeded successfully' })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Initialize task scheduler
export const taskScheduler = new TaskScheduler()
taskScheduler.start()

app.listen(port, () => {
  console.log(`API server running on port ${port}`)
})
