import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface StatsViewProps {
  selectedTopics: string[]
}

interface SentimentDistribution {
  positive: number
  negative: number
  neutral: number
}

// interface TopicStats {
//   totalComments: number
//   sentimentDistribution: SentimentDistribution
// }

const COLORS = ['#4ade80', '#f87171', '#94a3b8']

async function fetchTopicStats(topics: string[]) {
    const queryParams = new URLSearchParams()
    topics.forEach(topic => queryParams.append('topics', topic))
    const response = await fetch(`/api/stats?${queryParams}`)
    if (!response.ok) throw new Error('Failed to fetch topic stats')
    return response.json() // { aggregated, breakdown }
  }

function SentimentPieChart({ distribution, height = 300 }: { distribution: SentimentDistribution, height?: number }) {
  const chartData = [
    { name: 'Positive', value: distribution.positive },
    { name: 'Negative', value: distribution.negative },
    { name: 'Neutral', value: distribution.neutral }
  ]

  return (
    <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={height / 3}
            innerRadius={height / 5}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value, percent }) => 
              `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
            }
          >
            {chartData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(20, 20, 20, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span style={{ color: 'white' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function StatsView({ selectedTopics }: StatsViewProps) {
    const { data, isLoading, error } = useQuery({
      queryKey: ['stats', selectedTopics],
      queryFn: () => fetchTopicStats(selectedTopics),
      enabled: selectedTopics.length > 0
    })
  
    if (selectedTopics.length === 0) {
      return (
        <div className="empty-state">
          Please select one or more topics to view statistics
        </div>
      )
    }
  
    if (isLoading) return <div className="loading">Loading statistics...</div>
    if (error) {
      console.error('Stats error:', error)
      return <div className="error">Error loading statistics</div>
    }
    if (!data || !data.breakdown) return null
  
    const { breakdown, aggregated } = data
  
    // If there's only one topic, ensure breakdown[0] is safe:
    if (selectedTopics.length === 1 && breakdown.length > 0) {
      const single = breakdown[0]
      return (
        <div className="stats-container">
          <div className="stats-card">
            <h2 className="stats-title">{single.topic}</h2>
            <div className="stats-value">{single.totalComments.toLocaleString()}</div>
            <div className="stats-label">Total Comments</div>
            <h3 className="sentiment-title">Sentiment Distribution</h3>
            <SentimentPieChart distribution={single.sentimentDistribution} height={400} />
          </div>
        </div>
      )
    }
  
    // Multiple topics selected
    return (
      <div className="stats-container">
        <div className="stats-card">
          <h2 className="stats-title">
            Combined Stats for {selectedTopics.length} Topics
          </h2>
          <div className="stats-value">
            {aggregated.totalComments.toLocaleString()}
          </div>
          <div className="stats-label">
            Total Comments (All Topics)
          </div>
          <SentimentPieChart distribution={aggregated.sentimentDistribution} height={400} />
        </div>
  
        <div className="stats-grid">
          {breakdown.map((topicStat: any) => (
            <div key={topicStat.topic} className="stats-card">
              <h3 className="stats-subtitle">{topicStat.topic}</h3>
              <div className="stats-value-secondary">
                {topicStat.totalComments.toLocaleString()} Comments
              </div>
              <SentimentPieChart distribution={topicStat.sentimentDistribution} height={300} />
            </div>
          ))}
        </div>
      </div>
    )
  }