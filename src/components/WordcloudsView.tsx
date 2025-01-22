import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import d3Cloud from 'd3-cloud'
import * as d3 from 'd3'

interface WordcloudsViewProps {
  selectedTopics: string[]
}

interface WordFrequency {
  text: string
  value: number
}

interface WordcloudData {
  topic: string
  wordFreqs: WordFrequency[]
}

async function fetchWordclouds(topics: string[]): Promise<WordcloudData[]> {
  const queryParams = new URLSearchParams()
  topics.forEach(topic => queryParams.append('topics', topic))
  
  const response = await fetch(`https://sentiment-dash-worker.rohan-a-patil.workers.dev/api/wordclouds?${queryParams}`)
  if (!response.ok) {
    throw new Error('Failed to fetch wordcloud data')
  }
  const data = await response.json()
  return data
}

function WordCloud({ data, width, height }: { data: WordFrequency[], width: number, height: number }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data?.length) return

    try {
      const svg = d3.select(svgRef.current)
      svg.selectAll("*").remove()

      // Validate and clean data
      const validData = data
        .filter(d => d && typeof d.text === 'string' && typeof d.value === 'number' && d.value > 0)
        .slice(0, 50)

      if (validData.length === 0) return

      // Scale the word sizes to be more visible
      const maxValue = Math.max(...validData.map(d => d.value))
      const fontSize = d3.scaleLinear()
        .domain([0, maxValue])
        .range([14, 48])

      const layout = d3Cloud()
        .size([width, height])
        .words(validData.map(d => ({ ...d })))
        .padding(3)
        .rotate(() => 0)
        .fontSize(d => fontSize((d as WordFrequency).value))
        .on("end", draw)

      layout.start()

      function draw(words: d3Cloud.Word[]) {
        const g = svg
          .append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`)

        g.selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", d => `${d.size}px`)
          .style("font-family", "Inter, sans-serif")
          .style("font-weight", "bold")
          .style("fill", () => d3.interpolateBlues(Math.random()))
          .attr("text-anchor", "middle")
          .attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`)
          .text(d => d.text || '')
          .style("cursor", "pointer")
          .on("mouseover", function() {
            d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 0.7)
          })
          .on("mouseout", function() {
            d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 1)
          })
      }
    } catch {
      // Silently handle errors
    }
  }, [data, width, height])

  return (
    <div className="bg-white w-full h-full flex items-center justify-center p-4">
      <svg 
        ref={svgRef} 
        width={width} 
        height={height} 
        className="overflow-visible"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
}

export default function WordcloudsView({ selectedTopics }: WordcloudsViewProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wordclouds', selectedTopics],
    queryFn: () => fetchWordclouds(selectedTopics),
    enabled: selectedTopics.length > 0
  })

  if (selectedTopics.length === 0) {
    return <div className="text-gray-500">Please select one or more topics to view word clouds</div>
  }

  if (isLoading) return <div>Loading word clouds...</div>
  if (error) return <div>Error loading word clouds</div>
  if (!data) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((wordcloud) => {
        if (!wordcloud?.wordFreqs?.length) {
          return (
            <div key={wordcloud.topic} className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{wordcloud.topic}</h2>
              <div className="text-gray-500">No word cloud data available</div>
            </div>
          );
        }
        
        return (
          <div key={wordcloud.topic} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{wordcloud.topic}</h2>
            <div className="aspect-square w-full">
              <WordCloud
                data={wordcloud.wordFreqs}
                width={350}
                height={350}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
} 