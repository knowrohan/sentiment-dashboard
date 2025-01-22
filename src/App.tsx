import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TopicSelector from './components/TopicSelector'
import StatsView from './components/StatsView'
import TrendsView from './components/TrendsView'
import WordcloudsView from './components/WordcloudsView'
import './index.css';

const queryClient = new QueryClient()

type ViewType = 'stats' | 'trends' | 'wordclouds'

function App() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<ViewType>('stats')
  const [showTooltip, setShowTooltip] = useState(false)

  const tooltipText = "This dashboard serves data from a static D1 database. There are 3 handpicked videos and about 600 comments per topic. Comments are processed using VADER to determine their emotional tone (positive, negative, or neutral). Visualizations are generated using Recharts and D3.js"

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <div className="app-content">
          <div className="glass-container">
            <h1 className="app-title">
              Sentiment Analysis Dashboard
              <div className="info-icon-container">
                <button
                  className="info-icon"
                  onClick={() => setShowTooltip(!showTooltip)}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z" fill="currentColor"/>
                  </svg>
                </button>
                {showTooltip && (
                  <div className="custom-tooltip">
                    {tooltipText}
                  </div>
                )}
              </div>
            </h1>
            
            <div className="controls-container">
              <TopicSelector 
                selectedTopics={selectedTopics} 
                onChange={setSelectedTopics} 
              />

              <nav className="view-selector">
                <button
                  onClick={() => setCurrentView('stats')}
                  className={`button ${currentView === 'stats' ? 'active' : ''}`}
                >
                  Stats View
                </button>
                <button
                  onClick={() => setCurrentView('trends')}
                  className={`button ${currentView === 'trends' ? 'active' : ''}`}
                >
                  Trends View
                </button>
                <button
                  onClick={() => setCurrentView('wordclouds')}
                  className={`button ${currentView === 'wordclouds' ? 'active' : ''}`}
                >
                  Wordclouds View
                </button>
              </nav>
            </div>

            <div className="view-container">
              {currentView === 'stats' && <StatsView selectedTopics={selectedTopics} />}
              {currentView === 'trends' && <TrendsView selectedTopics={selectedTopics} />}
              {currentView === 'wordclouds' && <WordcloudsView selectedTopics={selectedTopics} />}
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
