'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export function TableViewHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="min-h-[2.75rem] sm:min-h-0"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Help</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-[600px] max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] overflow-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Table View Guide</DialogTitle>
            <DialogDescription className="text-sm">
              Master your quest management with powerful table features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[60vh] py-4">
            {/* Selection & Bulk Actions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">☑️</span>
                Selection & Bulk Actions
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-7">
                <li>• Click checkboxes to select individual quests</li>
                <li>• Use the header checkbox to select all on current page</li>
                <li>• Bulk complete, move, or delete multiple quests at once</li>
              </ul>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">🔀</span>
                Sorting
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-7">
                <li>• Click column headers to sort (ascending → descending → unsorted)</li>
                <li>• Sort by name, priority, difficulty, due date, or rewards</li>
                <li>• Difficulty is shown as a number with a sword e.g., <strong>3⚔️</strong></li>
                <li>• Arrow icons show current sort direction</li>
              </ul>
            </div>

            {/* Search & Filtering */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">🔍</span>
                Search
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-7">
                <li>• Use the search box to filter quests by title or description</li>
                <li>• Results update instantly as you type</li>
                <li>• Clear search to show all quests again</li>
              </ul>
            </div>

            {/* Column Customization */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                Column Customization
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-7">
                <li>• Click "Columns" button to show/hide columns</li>
                <li>• Choose which quest information you want to see</li>
                <li>• Your preferences are saved automatically</li>
              </ul>
            </div>

            {/* Inline Editing */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">✏️</span>
                Quick Edit
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-7">
                <li>• Tap or click any cell on a quest row to open Quick Edit</li>
                <li>• Edit quest details without leaving the table</li>
                <li>• Changes save immediately</li>
              </ul>
            </div>

            {/* Pagination */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">📄</span>
                Pagination
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-7">
                <li>• Choose how many quests to show per page (10-100)</li>
                <li>• Navigate between pages with Previous/Next buttons</li>
                <li>• See total quest count and current page position</li>
              </ul>
            </div>

            {/* Export */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">📥</span>
                Export to CSV
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-7">
                <li>• Click "Export" to download all quests as CSV file</li>
                <li>• Only visible columns are included in export</li>
                <li>• Open in Excel, Google Sheets, or any spreadsheet app</li>
              </ul>
            </div>

            {/* Mobile Tips */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">📱</span>
                Mobile Tips
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-7">
                <li>• Swipe horizontally to see all columns</li>
                <li>• All touch targets are optimized for finger taps</li>
                <li>• Landscape mode recommended for best experience</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full min-h-[2.75rem] sm:min-h-0"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
