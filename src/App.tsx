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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <div className="app-content">
          <div className="glass-container">
            <h1 className="app-title">
              Sentiment Analysis Dashboard
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
