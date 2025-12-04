'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'rectangular' | 'text'
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({ 
  className, 
  variant = 'default',
  animation = 'pulse',
  ...props 
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  // Use CSS variables for theme-aware colors that don't flash
  const baseClasses = "skeleton-base"
  
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none", 
    text: "rounded-sm h-4"
  }
  
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-size-200",
    none: ""
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      {...props}
    />
  )
}

// Card Skeleton Component
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-2xl p-4 border border-border/20 animate-pulse", className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-8 h-8 rounded-xl" variant="circular" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  )
}

// Quick Action Card Skeleton
export function QuickActionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 min-h-[140px] sm:min-h-[160px] bg-gradient-to-br from-muted/20 to-muted/40 border border-border/20 animate-pulse", className)}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl" variant="circular" />
          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" variant="circular" />
        </div>
        
        <div className="flex-1">
          <Skeleton className="w-24 sm:w-32 h-5 sm:h-6 mb-1 sm:mb-2" />
          <Skeleton className="w-20 sm:w-28 h-3 sm:h-4" />
        </div>
        
        <div className="mt-2 sm:mt-4 flex items-center">
          <Skeleton className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-2" variant="circular" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
    </div>
  )
}

// List Item Skeleton
export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("px-4 py-3 border-b border-border/10 animate-pulse", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" variant="circular" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <Skeleton className="w-32 h-4 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-16 h-3 rounded-full" />
                <Skeleton className="w-1 h-1 rounded-full" variant="circular" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="text-right">
                <Skeleton className="w-16 h-4 mb-1" />
                <Skeleton className="w-12 h-3" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="w-7 h-7 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Header Skeleton
export function HeaderSkeleton() {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-muted/60 to-muted/40 animate-pulse" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-2xl" variant="circular" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="w-16 h-5 rounded-full" />
                  <Skeleton className="w-1 h-1 rounded-full" variant="circular" />
                  <Skeleton className="w-20 h-3" />
                </div>
                <Skeleton className="w-48 h-8" />
              </div>
            </div>
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-12 h-12 rounded-2xl" variant="circular" />
        </div>
      </div>
    </header>
  )
}

// Balance Card Skeleton
export function BalanceCardSkeleton() {
  return (
    <section className="glass rounded-3xl border border-border shadow-premium p-6 md:p-8 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="w-32 h-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-80 h-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" variant="circular" />
              <Skeleton className="w-32 h-3" />
            </div>
          </div>
        </div>
        <div className="text-center lg:text-right">
          <div className="space-y-2">
            <Skeleton className="w-40 h-12" />
            <div className="flex items-center justify-center lg:justify-end gap-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-4 h-4" variant="circular" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Chat Message Skeleton
export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-pulse`}>
      {!isUser && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" variant="circular" />}
      <div className={`max-w-[80%] ${isUser ? 'bg-primary/10' : 'bg-muted/20'} rounded-2xl p-4`}>
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-4" />
        </div>
      </div>
      {isUser && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" variant="circular" />}
    </div>
  )
}

// Filter Skeleton
export function FilterSkeleton() {
  return (
    <div className="glass-premium rounded-2xl p-4 border border-border/20 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-xl" variant="circular" />
          <Skeleton className="w-12 h-4" />
        </div>
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-full h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
// Modal Skeleton Component
export function ModalSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50", className)}>
      <div className="glass rounded-2xl shadow-premium-lg p-6 w-full max-w-md border border-border animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" variant="circular" />
            <div>
              <Skeleton className="w-32 h-5 mb-2" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-18 h-4" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Skeleton className="flex-1 h-10 rounded-lg" />
          <Skeleton className="flex-1 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Table Skeleton Component
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass rounded-2xl border border-border shadow-premium overflow-hidden animate-pulse">
      <div className="p-4 border-b border-border">
        <Skeleton className="w-32 h-6" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-8' : j === 1 ? 'flex-1' : 'w-20'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Form Skeleton Component
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-full h-10 rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="flex-1 h-10 rounded-lg" />
        <Skeleton className="flex-1 h-10 rounded-lg" />
      </div>
    </div>
  )
}