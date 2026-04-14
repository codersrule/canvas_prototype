import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Classroom API' })
})

app.listen(PORT, () => {
  console.log(`Classroom API running on http://localhost:${PORT}`)
})
