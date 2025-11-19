import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface TrendsViewProps {
  selectedTopics: string[]
}

interface TrendData {
  date: string
  [key: string]: number | string // For dynamic topic names
}

const COLORS = [
  '#4ade80',  // Green
  '#f87171',  // Red
  '#60a5fa',  // Blue
  '#FFCF56',  // Our theme color
  '#c084fc',  // Purple
  '#f472b6',  // Pink
  '#818cf8'   // Indigo
]

async function fetchTrendData(topics: string[]): Promise<TrendData[]> {
  const queryParams = new URLSearchParams()
  topics.forEach(topic => queryParams.append('topics', topic))
  
  const response = await fetch(`https://sentiment-dash-worker.rohanpatil.workers.dev/api/trends?${queryParams}`)
  if (!response.ok) {
    throw new Error('Failed to fetch trend data')
  }
  return response.json()
}

export default function TrendsView({ selectedTopics }: TrendsViewProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trends', selectedTopics],
    queryFn: () => fetchTrendData(selectedTopics),
    enabled: selectedTopics.length > 0
  })

  if (selectedTopics.length === 0) {
    return (
      <div className="empty-state">
        Please select one or more topics to view trends
      </div>
    )
  }

  if (isLoading) return <div className="loading">Loading trends...</div>
  if (error) return <div className="error">Error loading trends</div>
  if (!data) return null

  return (
    <div className="trends-container">
      {selectedTopics.map((topic, topicIndex) => (
        <div key={topic} className="trend-card">
          <h2 className="trend-title">{topic} - Sentiment Trend</h2>
          <div className="trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.1)" 
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis
                  domain={[-1, 1]}
                  tickFormatter={(value) => value.toFixed(2)}
                  label={{ 
                    value: 'Sentiment Score', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'rgba(255,255,255,0.5)' }
                  }}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [value.toFixed(3), 'Sentiment Score']}
                  contentStyle={{
                    background: 'rgba(20, 20, 20, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={topic}
                  stroke={COLORS[topicIndex % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={topic}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  )
} 