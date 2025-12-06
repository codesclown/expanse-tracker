# Shopping Page - Quick Start Guide

## ✅ Backend Complete
- Database schema ✓
- API routes ✓
- Export functions ✓

## 🎯 Create These 4 Files

### 1. Shopping Category Modal
**File:** `src/components/ShoppingCategoryModal.tsx`

**Copy from:** `src/components/PlanningCategoryModal.tsx`

**Changes:**
- Remove all date-related fields (startDate, endDate, expiryDate, type)
- Keep only: name, icon, color, expectedCost
- Update title: "Create Shopping Category"

**Quick fields to keep:**
```typescript
const [formData, setFormData] = useState({
  name: '',
  icon: '🛒',
  color: 'from-blue-500 to-cyan-600',
  expectedCost: ''
})
```

---

### 2. Shopping Item Modal
**File:** `src/components/ShoppingItemModal.tsx`

**Copy from:** `src/components/ExpensePlanningModal.tsx`

**Changes:**
- Replace `title` → `name`
- Replace `amount` → `expectedPrice`
- Remove `date` field
- Add `quantity` and `unit` fields

**Quick fields:**
```typescript
const [formData, setFormData] = useState({
  name: '',
  expectedPrice: '',
  quantity: '1',
  unit: 'pcs',
  categoryId: selectedCategoryId || '',
  notes: ''
})
```

---

### 3. Shopping Category Details Modal
**File:** `src/components/ShoppingCategoryDetailsModal.tsx`

**Copy from:** `src/components/CategoryDetailsModal.tsx`

**Changes:**
- Update props to use `items` instead of `expenses`
- Add `onMarkBought` prop
- Update export to use shopping export functions
- Show quantity and unit for each item
- Add checkbox to mark as bought

**Key prop:**
```typescript
interface ShoppingCategoryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  category: any
  items: any[]
  onDeleteItem: (id: string) => void
  onEditItem: (item: any) => void
  onMarkBought: (item: any) => void
  onExport: (format: 'pdf' | 'excel' | 'email') => void
}
```

---

### 4. Main Shopping Page
**File:** `src/app/shopping/page.tsx`

**Copy from:** `src/app/expense-planning/page.tsx`

**Key changes:**

#### Update imports:
```typescript
import ShoppingCategoryModal from '@/components/ShoppingCategoryModal'
import ShoppingItemModal from '@/components/ShoppingItemModal'
import ShoppingCategoryDetailsModal from '@/components/ShoppingCategoryDetailsModal'
import { exportShoppingCategoryToPDF, exportShoppingCategoryToExcel, sendShoppingCategoryEmail } from '@/lib/shoppingExport'
```

#### Update interfaces:
```typescript
interface ShoppingCategory {
  id: string
  name: string
  icon: string
  color: string
  expectedCost: number
  realCost: number
  isActive: boolean
  items: ShoppingItem[]
  createdAt: string
}

interface ShoppingItem {
  id: string
  name: string
  categoryId?: string
  expectedPrice: number
  actualPrice?: number
  quantity: number
  unit: string
  isBought: boolean
  notes?: string
  createdAt: string
}
```

#### Update API endpoints:
```typescript
// Change all API calls:
'/api/planning-categories' → '/api/shopping-categories'
'/api/expense-planning' → '/api/shopping-items'
```

#### Add Mark as Bought handler:
```typescript
const handleMarkBought = async (item: ShoppingItem) => {
  const actualPrice = prompt(`Enter actual price for ${item.name}:`, item.expectedPrice.toString())
  
  if (actualPrice === null) return
  
  const price = parseFloat(actualPrice)
  if (isNaN(price) || price < 0) {
    addNotification({
      type: 'error',
      title: 'Invalid Price',
      message: 'Please enter a valid price',
      duration: 3000
    })
    return
  }
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/shopping-items/${item.id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        isBought: true,
        actualPrice: price
      })
    })

    if (response.ok) {
      addNotification({
        type: 'success',
        title: 'Item Marked as Bought',
        message: `${item.name} marked as bought for ₹${price}`,
        duration: 4000
      })
      loadData()
    }
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Update Failed',
      message: 'Failed to update item',
      duration: 4000
    })
  }
}
```

#### Update export handler:
```typescript
const handleExportCategory = async (format: 'pdf' | 'excel' | 'email') => {
  if (!selectedCategory) return

  const categoryItems = items.filter(i => i.categoryId === selectedCategory.id)

  try {
    if (format === 'pdf') {
      await exportShoppingCategoryToPDF(selectedCategory, categoryItems, user?.email)
      addNotification({
        type: 'success',
        title: 'PDF Downloaded',
        message: 'Shopping bill has been downloaded',
        duration: 3000
      })
    } else if (format === 'excel') {
      exportShoppingCategoryToExcel(selectedCategory, categoryItems)
      addNotification({
        type: 'success',
        title: 'Excel Downloaded',
        message: 'Shopping bill has been downloaded',
        duration: 3000
      })
    } else if (format === 'email') {
      if (!user?.email) {
        throw new Error('User email not found')
      }
      await sendShoppingCategoryEmail(selectedCategory, categoryItems, user.email)
      addNotification({
        type: 'success',
        title: 'Email Sent',
        message: `Shopping bill sent to ${user.email}`,
        duration: 5000
      })
    }
  } catch (error: any) {
    addNotification({
      type: 'error',
      title: 'Export Failed',
      message: error?.message || 'Failed to export shopping bill',
      duration: 4000
    })
  }
}
```

#### Update header colors (green theme):
```typescript
// Change header gradient from purple to green:
from-indigo-600 via-purple-600 to-pink-600
↓
from-emerald-600 via-green-600 to-teal-600
```

#### Update title and icon:
```typescript
<h1 className="heading-page">Shopping</h1>
<p className="text-sm text-white/80">Organize shopping by categories and track costs</p>

// Icon:
<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>
```

---

## 🔗 Add Navigation

### Update BottomNav (`src/components/BottomNav.tsx`)
Add after the planning item:
```typescript
{
  path: '/shopping',
  label: 'Shopping',
  icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
```

---

## 🎨 Color Theme

Use green/emerald colors throughout:
- Primary gradient: `from-emerald-500 to-green-600`
- Header: `from-emerald-600 via-green-600 to-teal-600`
- Buttons: `from-emerald-500 to-green-600`
- Icons: Green shades

---

## ✅ Testing Steps

1. Create a shopping category (e.g., "Groceries")
2. Add items to the category with expected prices
3. Mark an item as bought and enter actual price
4. View category details
5. Export bill as PDF
6. Check that costs calculate correctly

---

## 🚀 That's It!

Just copy the 4 files from planning page, make the changes listed above, and you're done! The backend handles all the calculations automatically.

**Time estimate:** 30-45 minutes

**Difficulty:** Easy (mostly copy-paste with minor changes)
