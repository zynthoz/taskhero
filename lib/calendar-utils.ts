// Calendar date utilities (client-side)

export type CalendarViewType = 'month' | 'week' | 'day'

// Get date range for different calendar views
export function getDateRangeForView(
  date: Date,
  view: CalendarViewType
): { startDate: string; endDate: string } {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  switch (view) {
    case 'month': {
      // Get the start of the month view (might include previous month days)
      const firstOfMonth = new Date(year, month, 1)
      const startDate = new Date(firstOfMonth)
      startDate.setDate(startDate.getDate() - startDate.getDay())
      
      // Get the end of the month view (might include next month days)
      const lastOfMonth = new Date(year, month + 1, 0)
      const endDate = new Date(lastOfMonth)
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
      
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }
    }
    
    case 'week': {
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      return {
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
      }
    }
    
    case 'day': {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      return {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      }
    }
  }
}

// Format date for display
export function formatCalendarDate(date: Date, view: CalendarViewType): string {
  switch (view) {
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    case 'week': {
      const endOfWeek = new Date(date)
      endOfWeek.setDate(date.getDate() + (6 - date.getDay()))
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    case 'day':
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
}

// Check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Get start of week for a given date
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() - day)
  result.setHours(0, 0, 0, 0)
  return result
}

// Get end of week for a given date
export function getEndOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() + (6 - day))
  result.setHours(23, 59, 59, 999)
  return result
}
