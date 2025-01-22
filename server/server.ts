import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
import { z } from 'zod'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const db = new sqlite3.Database('./final_db.db', sqlite3.OPEN_READONLY)

// Promisify database methods
const dbAll = promisify(db.all).bind(db)
const dbGet = promisify(db.get).bind(db)

// Input validation schema
const topicsQuerySchema = z.object({
  topics: z.union([z.string(), z.array(z.string())])
})

// Utility function to ensure topics is always an array
function normalizeTopics(topics: string | string[]): string[] {
  return Array.isArray(topics) ? topics : [topics]
}

// Routes
app.get('/api/topics', async (_, res) => {
  try {
    const topics = await dbAll('SELECT DISTINCT topic_name FROM videos ORDER BY topic_name')
    res.json(topics.map((t: any) => t.topic_name))
  } catch (error) {
    console.error('Error fetching topics:', error)
    res.status(500).json({ error: 'Failed to fetch topics' })
  }
})

app.get('/api/stats', async (req, res) => {
    try {
      const { topics } = topicsQuerySchema.parse(req.query)
      const topicsArr = normalizeTopics(topics)
      if (!topicsArr.length) {
        return res.json({ aggregated: { totalComments: 0, sentimentDistribution: { positive: 0, negative: 0, neutral: 0 } }, breakdown: [] })
      }
      const placeholders = topicsArr.map(() => '?').join(',')
      const rows = await dbAll(
        `SELECT topic_name, sentiment_label, COUNT(*) as count
         FROM comments
         WHERE topic_name IN (${placeholders})
         GROUP BY topic_name, sentiment_label`,
        topicsArr
      )
      const statsByTopic: Record<string, {
        topic: string
        totalComments: number
        sentimentDistribution: { positive: number; negative: number; neutral: number }
      }> = {}
      topicsArr.forEach(t => {
        statsByTopic[t] = {
          topic: t,
          totalComments: 0,
          sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
        }
      })
      rows.forEach(row => {
        const topicStat = statsByTopic[row.topic_name]
        topicStat.totalComments += row.count
        if (row.sentiment_label && topicStat.sentimentDistribution[row.sentiment_label] !== undefined) {
          topicStat.sentimentDistribution[row.sentiment_label] = row.count
        }
      })
      let aggregatedTotal = 0
      const aggregatedDistribution = { positive: 0, negative: 0, neutral: 0 }
      Object.values(statsByTopic).forEach(stat => {
        aggregatedTotal += stat.totalComments
        aggregatedDistribution.positive += stat.sentimentDistribution.positive
        aggregatedDistribution.negative += stat.sentimentDistribution.negative
        aggregatedDistribution.neutral += stat.sentimentDistribution.neutral
      })
      res.json({
        aggregated: {
          totalComments: aggregatedTotal,
          sentimentDistribution: aggregatedDistribution
        },
        breakdown: Object.values(statsByTopic)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      res.status(500).json({ error: 'Failed to fetch stats' })
    }
  })

app.get('/api/trends', async (req, res) => {
  try {
    const { topics } = topicsQuerySchema.parse(req.query)
    const topicsArr = normalizeTopics(topics)
    const placeholders = topicsArr.map(() => '?').join(',')

    const trends = await dbAll(
      `SELECT 
        DATE(comment_date) as date,
        topic_name,
        AVG(CAST(sentiment_score AS FLOAT)) as avg_score
       FROM comments 
       WHERE topic_name IN (${placeholders})
         AND sentiment_score IS NOT NULL
         AND comment_date IS NOT NULL
       GROUP BY DATE(comment_date), topic_name
       ORDER BY date`,
      topicsArr
    )

    // Transform into format needed by the frontend
    const trendsByDate = trends.reduce((acc: { [key: string]: any }, curr: any) => {
      if (!acc[curr.date]) {
        acc[curr.date] = { date: curr.date }
      }
      acc[curr.date][curr.topic_name] = parseFloat(curr.avg_score)
      return acc
    }, {})

    res.json(Object.values(trendsByDate))
  } catch (error) {
    console.error('Error fetching trends:', error)
    res.status(500).json({ error: 'Failed to fetch trends' })
  }
})

app.get('/api/wordclouds', async (req, res) => {
  try {
    const { topics } = topicsQuerySchema.parse(req.query)
    const topicsArr = normalizeTopics(topics)
    const placeholders = topicsArr.map(() => '?').join(',')

    const wordclouds = await dbAll(
      `SELECT topic_name, word_freqs FROM wordclouds WHERE topic_name IN (${placeholders})`,
      topicsArr
    )

    const result = wordclouds.map((wc: any) => {
      try {
        const wordFreqsObj = JSON.parse(wc.word_freqs)
        
        const wordFreqs = Object.entries(wordFreqsObj)
          .map(([word, freq]) => ({
            text: word,
            value: typeof freq === 'number' ? freq : parseInt(freq as string, 10)
          }))
          .filter(item => !isNaN(item.value) && item.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 100)

        return {
          topic: wc.topic_name,
          wordFreqs
        }
      } catch (error) {
        console.error('Error processing word frequencies for topic:', wc.topic_name)
        return {
          topic: wc.topic_name,
          wordFreqs: []
        }
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Error fetching wordclouds:', error)
    res.status(500).json({ error: 'Failed to fetch wordclouds' })
  }
})

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
}) 