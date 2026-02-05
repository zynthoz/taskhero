'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Task, getDifficultyDisplay } from '@/types/task'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
  Download,
  Settings,
  Trash2,
  CheckCircle2,
  FolderInput,
  Edit,
} from 'lucide-react'
import { QuickEditDialog } from './quick-edit-dialog'
import { TableViewHelp } from './table-view-help'
import { bulkCompleteTask, bulkDeleteTasks } from '@/lib/bulk-actions'
import { loadTablePreferences, saveTablePreferences, getDefaultPreferences } from '@/lib/table-preferences'
import { useNotifications } from '@/lib/notifications'
import { TableSkeleton } from './table-skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TasksDataTableProps {
  tasks: Task[]
  isLoading: boolean
  onTaskUpdate: () => void
}

type SortDirection = 'asc' | 'desc' | null
type SortField = keyof Task | null

interface ColumnConfig {
  id: string
  label: string
  field: keyof Task | 'actions'
  visible: boolean
  sortable: boolean
  width?: number
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'title', label: 'Quest Name', field: 'title', visible: true, sortable: true },
  { id: 'priority', label: 'Priority', field: 'priority', visible: true, sortable: true },
  { id: 'difficulty', label: 'Difficulty', field: 'difficulty', visible: true, sortable: true },
  { id: 'status', label: 'Status', field: 'status', visible: true, sortable: true },
  { id: 'due_date', label: 'Due Date', field: 'due_date', visible: true, sortable: true },
  { id: 'xp_reward', label: 'XP', field: 'xp_reward', visible: true, sortable: true },
  { id: 'gold_reward', label: 'Gold', field: 'gold_reward', visible: true, sortable: true },
  { id: 'created_at', label: 'Created', field: 'created_at', visible: false, sortable: true },
]

export function TasksDataTable({ tasks, isLoading, onTaskUpdate }: TasksDataTableProps) {
  const { success: showSuccess, error: showError } = useNotifications()
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false)
  const [isBulkActionProcessing, setIsBulkActionProcessing] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    const prefs = loadTablePreferences()
    if (prefs) {
      setRowsPerPage(prefs.rowsPerPage)
      setSortField(prefs.sortField)
      setSortDirection(prefs.sortDirection)
      
      // Update column visibility from saved preferences
      setColumns(prev => prev.map(col => ({
        ...col,
        visible: prefs.columns[col.field as keyof typeof prefs.columns] ?? col.visible
      })))
    }
  }, [])

  // Save preferences when they change
  useEffect(() => {
    const columnVisibility = columns.reduce((acc, col) => {
      acc[col.field as keyof typeof acc] = col.visible
      return acc
    }, {} as any)

    saveTablePreferences({
      columns: columnVisibility,
      rowsPerPage,
      sortField,
      sortDirection,
    })
  }, [columns, rowsPerPage, sortField, sortDirection])

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
        }

        return 0
      })
    }

    return result
  }, [tasks, searchQuery, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTasks.length / rowsPerPage)
  const paginatedTasks = filteredAndSortedTasks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      )
      if (sortDirection === 'desc') {
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedTasks.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedTasks.map(task => task.id)))
    }
  }

  const handleSelectRow = (taskId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedRows(newSelected)
  }

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const handleBulkComplete = async () => {
    setIsBulkActionProcessing(true)
    try {
      await bulkCompleteTask(Array.from(selectedRows))
      showSuccess(`${selectedRows.size} quest${selectedRows.size !== 1 ? 's' : ''} completed!`)
      setSelectedRows(new Set())
      onTaskUpdate()
    } catch (error) {
      showError('Failed to complete quests')
    } finally {
      setIsBulkActionProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} quest${selectedRows.size !== 1 ? 's' : ''}? This cannot be undone.`)) {
      return
    }

    setIsBulkActionProcessing(true)
    try {
      await bulkDeleteTasks(Array.from(selectedRows))
      showSuccess(`${selectedRows.size} quest${selectedRows.size !== 1 ? 's' : ''} deleted`)
      setSelectedRows(new Set())
      onTaskUpdate()
    } catch (error) {
      showError('Failed to delete quests')
    } finally {
      setIsBulkActionProcessing(false)
    }
  }

  const handleQuickEdit = (task: Task) => {
    setEditingTask(task)
    setIsQuickEditOpen(true)
  }

  const exportToCSV = () => {
    const visibleColumns = columns.filter(col => col.visible && col.field !== 'actions')
    const headers = visibleColumns.map(col => col.label).join(',')
    const rows = filteredAndSortedTasks.map(task =>
      visibleColumns.map(col => {
        const value = task[col.field as keyof Task]
        return typeof value === 'string' ? `"${value}"` : value
      }).join(',')
    )
    
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getPriorityEmoji = (priority: number) => {
    switch (priority) {
      case 5: return '🔴' // Urgent
      case 4: return '🟠' // High
      case 3: return '🟡' // Normal
      case 2: return '🔵' // Low
      case 1: return '⚪' // Lowest
      default: return '📋'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return 'Urgent'
      case 4: return 'High'
      case 3: return 'Normal'
      case 2: return 'Low'
      case 1: return 'Lowest'
      default: return 'Normal'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'in-progress': return 'text-blue-600 dark:text-blue-400'
      case 'overdue': return 'text-red-600 dark:text-red-400'
      default: return 'text-neutral-600 dark:text-neutral-400'
    }
  }

  const visibleColumns = columns.filter(col => col.visible)

  // Short labels for mobile to avoid overlapping in tiny screens
  const getHeaderAbbr = (colId: string) => {
    switch (colId) {
      case 'title': return 'Name'
      case 'priority': return 'Pri'
      case 'difficulty': return 'Diff'
      case 'status': return 'Stat'
      case 'due_date': return 'Due'
      case 'xp_reward': return 'XP'
      case 'gold_reward': return 'Gold'
      case 'created_at': return 'Created'
      default: return colId
    }
  }

  if (isLoading) {
    // Show table-shaped skeleton while loading to match the table layout
    const skeletonCount = Math.min(rowsPerPage || 5, 8)
    return (
      <div className="flex flex-col h-full bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm overflow-hidden p-4">
        <TableSkeleton rows={skeletonCount} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm overflow-hidden">
      {/* Toolbar - Fixed at top */}
      <div className="flex-shrink-0 p-1 sm:p-2 border-b border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-neutral-900/40">
        <div className="flex flex-col gap-1">
          {/* Top Row: Search and Actions (minimal) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
              <Input
                placeholder="Search quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-5 sm:pl-6 h-6 sm:h-7 text-[10px] sm:text-[11px]"
              />
            </div>

            {/* Action Buttons (compact) */}
            <div className="flex items-center gap-1 sm:gap-2">
              <TableViewHelp />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="h-8 sm:h-9 w-8 sm:w-auto p-1 sm:p-2"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportToCSV}
                className="h-8 sm:h-9 w-8 sm:w-auto p-1 sm:p-2"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Column Settings Panel */}
          {showColumnSettings && (
            <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
              <h3 className="text-sm font-semibold mb-2 text-neutral-300">Column Visibility</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {columns.map(col => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 p-2 rounded"
                  >
                    <Checkbox
                      checked={col.visible}
                      onCheckedChange={() => toggleColumnVisibility(col.id)}
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedRows.size > 0 && (
            <div className="flex items-center justify-between p-2 sm:p-3 bg-neutral-900/40 rounded-lg border border-neutral-800">
              <span className="text-xs sm:text-sm font-medium text-neutral-200">
                {selectedRows.size} quest{selectedRows.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkComplete}
                  disabled={isBulkActionProcessing}
                  className="h-8 sm:h-9 px-2 sm:px-3"
                >
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Complete</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isBulkActionProcessing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 sm:h-9 px-2 sm:px-3"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table - Scrollable body */}
      <div className="flex-1 overflow-auto min-h-0 overflow-x-hidden max-h-[calc(100dvh)] sm:max-h-[calc(100dvh)]">
        <Table className="relative w-full table-fixed">
          <TableHeader className="sticky top-0 bg-neutral-950 backdrop-blur-sm z-10 border-b border-neutral-800">
            <TableRow>
              {/* Checkbox Column (header intentionally empty) */}
              <TableHead className="w-8 sm:w-12" />

              {/* Dynamic Columns */}
              {visibleColumns.map(col => (
                <TableHead
                  key={col.id}
                  className={cn(
                    col.sortable && 'cursor-pointer select-none hover:bg-neutral-900/30',
                    'px-0.5 sm:px-1 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-neutral-300 break-words tracking-wide'
                  )}
                  onClick={() => col.sortable && col.field !== 'actions' && handleSort(col.field as keyof Task)}
                >
                  <div className="flex items-center gap-0.5 sm:gap-2">
                    {/* Mobile abbreviation + full label on sm+ */}
                    <span className="sm:hidden text-[11px]">{getHeaderAbbr(col.id)}</span>
                    <span className="hidden sm:inline">{col.label}</span>

                    {/* Sort icons hidden on mobile to save space */}
                    {col.sortable && sortField === col.field && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="hidden sm:inline w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      ) : sortDirection === 'desc' ? (
                        <ChevronDown className="hidden sm:inline w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      ) : null
                    )}
                    {col.sortable && sortField !== col.field && (
                      <ChevronsUpDown className="hidden sm:inline w-3 h-3 sm:w-4 sm:h-4 opacity-30 ml-1" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 1}
                  className="h-32 text-center text-neutral-500 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
                >
                  {searchQuery ? 'No quests found matching your search' : 'No quests yet. Create your first quest to get started!'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map(task => (
                <TableRow
                  key={task.id}
                  tabIndex={0}
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    // Ignore clicks on interactive controls (checkboxes, buttons, links, labels)
                    if (target.closest('input, button, a, label')) return
                    handleQuickEdit(task)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleQuickEdit(task)
                    }
                  }}
                  className={cn(
                    'cursor-pointer focus:outline-none hover:bg-neutral-800/50 border-b border-neutral-800',
                    selectedRows.has(task.id) && 'bg-neutral-800/60'
                  )}
                >
                  {/* Checkbox */}
                  <TableCell className="w-6 sm:w-8 flex-none">
                    <Checkbox
                      checked={selectedRows.has(task.id)}
                      onCheckedChange={() => handleSelectRow(task.id)}
                    />
                  </TableCell>

                  {/* Dynamic Cells */}
                  {visibleColumns.map(col => {
                    if (col.field === 'title') {
                      return (
                        <TableCell key={col.id} className="px-0.5 sm:px-1 py-0.5 sm:py-1 text-[11px] sm:text-[12px] font-medium max-w-[100px] sm:max-w-[140px] min-w-0 truncate text-neutral-100">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleQuickEdit(task)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickEdit(task) } }}
                            className="w-full cursor-pointer hover:underline focus:outline-none"
                          >
                            {task.title}
                          </div>
                        </TableCell>
                      )
                    }
                    if (col.field === 'priority') {
                      return (
                        <TableCell key={col.id} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-300 min-w-0 truncate">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleQuickEdit(task)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickEdit(task) } }}
                            className="w-full cursor-pointer hover:underline focus:outline-none flex items-center gap-1"
                          >
                            <span className="text-base sm:text-lg">{getPriorityEmoji(task.priority)}</span>
                            <span className="hidden sm:inline">
                              {getPriorityLabel(task.priority)}
                            </span>
                          </div>
                        </TableCell>
                      )
                    }
                    if (col.field === 'difficulty') {
                      return (
                        <TableCell key={col.id} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center text-neutral-300 min-w-0 truncate">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleQuickEdit(task)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickEdit(task) } }}
                            className="inline-block cursor-pointer hover:underline focus:outline-none"
                          >
                            <span className="text-amber-500 font-medium">{getDifficultyDisplay(task.difficulty)}</span>
                          </div>
                        </TableCell>
                      )
                    }
                    if (col.field === 'status') {
                      return (
                        <TableCell key={col.id} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-300 min-w-0 truncate">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleQuickEdit(task)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickEdit(task) } }}
                            className="w-full cursor-pointer hover:underline focus:outline-none"
                          >
                            <span className={cn('capitalize text-xs sm:text-sm', getStatusColor(task.status))}>
                              {task.status.replace('-', ' ')}
                            </span>
                          </div>
                        </TableCell>
                      )
                    }
                    if (col.field === 'due_date') {
                      return (
                        <TableCell key={col.id} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 min-w-0 truncate">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleQuickEdit(task)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickEdit(task) } }}
                            className="w-full cursor-pointer hover:underline focus:outline-none"
                          >
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                          </div>
                        </TableCell>
                      )
                    }
                    if (col.field === 'xp_reward') {
                      return (
                        <TableCell key={col.id} className="px-0.5 sm:px-1 py-0.5 sm:py-1 text-[10px] sm:text-[11px] text-blue-400 font-semibold min-w-0 truncate">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleQuickEdit(task)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickEdit(task) } }}
                            className="w-full cursor-pointer hover:underline focus:outline-none"
                          >
                            <span className="hidden sm:inline">{task.xp_reward} XP</span>
                            <span className="sm:hidden">{task.xp_reward}</span>
                          </div>
                        </TableCell>
                      )
                    }
                    if (col.field === 'gold_reward') {
                      return (
                        <TableCell key={col.id} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base text-amber-400 font-semibold min-w-0 truncate">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleQuickEdit(task)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickEdit(task) } }}
                            className="w-full cursor-pointer hover:underline focus:outline-none"
                          >
                            {task.gold_reward}🪙
                          </div>
                        </TableCell>
                      )
                    }
                    if (col.field === 'created_at') {
                      return (
                        <TableCell key={col.id} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 min-w-0 truncate">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleQuickEdit(task)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickEdit(task) } }}
                            className="w-full cursor-pointer hover:underline focus:outline-none"
                          >
                            {new Date(task.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                      )
                    }

                    return null
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Quick Edit Dialog */}
      <QuickEditDialog
        task={editingTask}
        isOpen={isQuickEditOpen}
        onClose={() => {
          setIsQuickEditOpen(false)
          setEditingTask(null)
        }}
        onTaskUpdate={onTaskUpdate}
      />

      {/* Pagination - Fixed at bottom */}
      <div className="flex-shrink-0 p-0.5 sm:p-1 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-1 sm:items-center sm:justify-between">
          <div className="text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-400 text-center sm:text-left">
            Showing {paginatedTasks.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * rowsPerPage, filteredAndSortedTasks.length)} of{' '}
            {filteredAndSortedTasks.length} quests
          </div>

          <div className="flex flex-row gap-2 items-center justify-center sm:justify-end">
            {/* Rows per page */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-1 sm:px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs sm:text-sm h-8 sm:h-auto"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page navigation */}
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-6 px-1.5 text-[10px] sm:text-[11px]"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <div className="flex items-center gap-1 px-2 sm:px-3 h-8 justify-center">
                <span className="text-xs sm:text-sm font-medium">
                  {currentPage} / {totalPages || 1}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
