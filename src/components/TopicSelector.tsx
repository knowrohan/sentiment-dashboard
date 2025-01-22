import { useQuery } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'

interface TopicSelectorProps {
  selectedTopics: string[]
  onChange: (topics: string[]) => void
}

async function fetchTopics(): Promise<string[]> {
  const response = await fetch('/api/topics')
  if (!response.ok) {
    throw new Error('Failed to fetch topics')
  }
  return response.json()
}

export default function TopicSelector({ selectedTopics, onChange }: TopicSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: topics = [], isLoading, error } = useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading) return <div className="loading">Loading topics...</div>
  if (error) return <div className="error">Error loading topics</div>

  const toggleTopic = (topic: string) => {
    const newSelection = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic]
    onChange(newSelection)
  }

  const clearTopics = () => {
    onChange([])
    setIsOpen(false)
  }

  return (
    <div className="topic-selector-container">
      <div className="topic-selector" ref={dropdownRef}>
        <button
          className="selector-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>
            {selectedTopics.length === 0
              ? 'Select topics...'
              : `${selectedTopics.length} topic(s) selected`}
          </span>
          <svg
            className={`arrow-icon ${isOpen ? 'open' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        {isOpen && (
          <div className="topics-dropdown">
            {topics.map((topic) => (
              <div
                key={topic}
                className={`topic-option ${selectedTopics.includes(topic) ? 'selected' : ''}`}
                onClick={() => toggleTopic(topic)}
              >
                <span>{topic}</span>
                {selectedTopics.includes(topic) && (
                  <svg
                    className="check-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8L7 12L13 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedTopics.length > 0 && (
        <button className="clear-button" onClick={clearTopics}>
          Clear
        </button>
      )}
    </div>
  )
} 