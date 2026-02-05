import React from 'react'

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  const headerCols = ['','Quest Name', 'Priority', 'Difficulty', 'Status', 'Due Date', 'XP', 'Gold']

  return (
    <div className="w-full overflow-auto">
      <div className="animate-pulse">
        <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900">
          {/* Header */}
          <div className="flex items-center gap-0 px-4 py-3 border-b border-neutral-800 bg-neutral-950 text-sm font-semibold text-neutral-300">
            {headerCols.map((col, i) => (
              <div key={i} className={`flex-1 ${i === 0 ? 'w-12 flex-none' : 'min-w-[80px]'}`}>
                <div className="h-3 bg-neutral-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-2 p-3">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900 rounded-md">
                <div className="w-12">
                  <div className="h-4 bg-neutral-800 rounded"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-neutral-800 rounded w-3/5 mb-2"></div>
                  <div className="h-3 bg-neutral-800 rounded w-2/5"></div>
                </div>
                <div className="w-20">
                  <div className="h-4 bg-neutral-800 rounded"></div>
                </div>
                <div className="w-20 text-center">
                  <div className="h-4 bg-neutral-800 rounded mx-auto w-12"></div>
                </div>
                <div className="w-28">
                  <div className="h-4 bg-neutral-800 rounded"></div>
                </div>
                <div className="w-28">
                  <div className="h-4 bg-neutral-800 rounded"></div>
                </div>
                <div className="w-20">
                  <div className="h-4 bg-neutral-800 rounded mx-auto w-12"></div>
                </div>
                <div className="w-16">
                  <div className="h-4 bg-neutral-800 rounded mx-auto w-8"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
