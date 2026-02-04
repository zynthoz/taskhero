'use client'

import { Button } from '@/components/ui/button'

interface CalendarHeaderProps {
  currentDate: Date
  onPreviousPeriod: () => void
  onNextPeriod: () => void
  onToday: () => void
}

export function CalendarHeader({
  currentDate,
  onPreviousPeriod,
  onNextPeriod,
  onToday,
}: CalendarHeaderProps) {
  const formatTitle = () => {
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800">
      {/* Title and Navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPeriod}
            className="h-9 w-9 p-0"
          >
            <span className="text-lg">←</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPeriod}
            className="h-9 w-9 p-0"
          >
            <span className="text-lg">→</span>
          </Button>
        </div>
        
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white min-w-[200px]">
          {formatTitle()}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-9 px-3 text-sm"
        >
          Today
        </Button>
      </div>
    </div>
  )
}
