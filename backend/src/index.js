import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Classroom API</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem">
  <h1>Classroom API</h1>
  <p>This URL is the <strong>backend</strong> only. Open your <strong>static site</strong> URL to use the app.</p>
  <ul>
    <li><a href="/api/health">GET /api/health</a> — JSON health check</li>
  </ul>
</body></html>`)
})

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Classroom API' })
})

app.listen(PORT, () => {
  console.log(`Classroom API running on http://localhost:${PORT}`)
})
