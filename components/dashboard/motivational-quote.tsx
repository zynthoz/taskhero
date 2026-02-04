'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

const motivationalQuotes = [
  { text: "Small steps lead to big changes", emoji: "🚀" },
  { text: "Progress, not perfection", emoji: "⭐" },
  { text: "Every task completed is a victory", emoji: "🏆" },
  { text: "Consistency builds legends", emoji: "💪" },
  { text: "Your future self will thank you", emoji: "🌟" },
  { text: "One task at a time, one day at a time", emoji: "📅" },
  { text: "Turn plans into action", emoji: "⚡" },
  { text: "The best time to start is now", emoji: "🎯" },
  { text: "Build your empire, one quest at a time", emoji: "👑" },
  { text: "Level up your life", emoji: "📈" },
]

export function MotivationalQuote() {
  const [quote, setQuote] = useState(motivationalQuotes[0])

  useEffect(() => {
    // Select a random quote based on the day (consistent for the whole day)
    const today = new Date().toDateString()
    const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = hash % motivationalQuotes.length
    setQuote(motivationalQuotes[index])
  }, [])

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-purple-800/30">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{quote.emoji}</div>
        <p className="text-sm text-neutral-300 italic">"{quote.text}"</p>
      </div>
    </Card>
  )
}
