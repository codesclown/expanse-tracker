# Mobile Skeleton Loader Usage Guide

## Available Mobile Skeleton Components

### 1. MobileDashboardSkeleton
Use for dashboard pages with balance cards, quick actions, and transaction lists.

```tsx
import { MobileDashboardSkeleton } from '@/components/Skeleton'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  
  if (loading) {
    return <MobileDashboardSkeleton />
  }
  
  return <div>Your dashboard content</div>
}
```

### 2. MobileExpenseListSkeleton
Use for expense/transaction list pages with filters and search.

```tsx
import { MobileExpenseListSkeleton } from '@/components/Skeleton'

export default function Expenses() {
  const { expenses, loading } = useExpenses()
  
  if (loading) {
    return <MobileExpenseListSkeleton />
  }
  
  return <div>Your expenses list</div>
}
```

### 3. MobileAnalyticsSkeleton
Use for analytics pages with charts and statistics.

```tsx
import { MobileAnalyticsSkeleton } from '@/components/Skeleton'

export default function Analytics() {
  const { data, loading } = useAnalytics()
  
  if (loading) {
    return <MobileAnalyticsSkeleton />
  }
  
  return <div>Your analytics content</div>
}
```

### 4. MobileSettingsSkeleton
Use for settings pages with grouped options.

```tsx
import { MobileSettingsSkeleton } from '@/components/Skeleton'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  
  if (loading) {
    return <MobileSettingsSkeleton />
  }
  
  return <div>Your settings content</div>
}
```

### 5. MobileProfileSkeleton
Use for profile pages with user info and stats.

```tsx
import { MobileProfileSkeleton } from '@/components/Skeleton'

export default function Profile() {
  const { user, loading } = useProfile()
  
  if (loading) {
    return <MobileProfileSkeleton />
  }
  
  return <div>Your profile content</div>
}
```

## Other Useful Skeleton Components

### CardSkeleton
For individual card components:
```tsx
<CardSkeleton className="w-full" />
```

### ListItemSkeleton
For list items in transactions/expenses:
```tsx
{Array.from({ length: 5 }).map((_, i) => (
  <ListItemSkeleton key={i} />
))}
```

### FormSkeleton
For forms and modals:
```tsx
<FormSkeleton fields={4} />
```

### ModalSkeleton
For loading modals:
```tsx
<ModalSkeleton />
```

### TableSkeleton
For data tables:
```tsx
<TableSkeleton rows={10} cols={5} />
```

## Implementation Example

Here's a complete example for a dashboard page:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { MobileDashboardSkeleton } from '@/components/Skeleton'
import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Fetch your data here
        const response = await fetch('/api/dashboard')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  // Show skeleton while loading
  if (loading) {
    return <MobileDashboardSkeleton />
  }

  // Show actual content when loaded
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Your actual dashboard content */}
    </div>
  )
}
```

## Best Practices

1. **Always show skeleton on initial load** - Improves perceived performance
2. **Match skeleton structure to actual content** - Reduces layout shift
3. **Use appropriate skeleton for each page type** - Better user experience
4. **Keep loading states consistent** - Use same skeleton across similar pages
5. **Add minimum loading time if needed** - Prevents flash of skeleton for fast loads

```tsx
// Minimum loading time example
useEffect(() => {
  const minLoadTime = 500 // 500ms minimum
  const startTime = Date.now()
  
  async function fetchData() {
    const data = await fetch('/api/data')
    const elapsed = Date.now() - startTime
    
    if (elapsed < minLoadTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed))
    }
    
    setLoading(false)
  }
  
  fetchData()
}, [])
```

## Pages to Update

Apply skeleton loaders to these pages:
- ✅ `/dashboard` - Use MobileDashboardSkeleton
- ✅ `/expenses` - Use MobileExpenseListSkeleton
- ✅ `/analytics` - Use MobileAnalyticsSkeleton
- ✅ `/settings` - Use MobileSettingsSkeleton
- ✅ `/settings/profile` - Use MobileProfileSkeleton
- ✅ `/reports` - Use MobileAnalyticsSkeleton
- ✅ `/subscriptions` - Use MobileExpenseListSkeleton
- ✅ `/udhar` - Use MobileExpenseListSkeleton
- ✅ `/shopping-list` - Use MobileExpenseListSkeleton
- ✅ `/chat` - Use ChatMessageSkeleton
