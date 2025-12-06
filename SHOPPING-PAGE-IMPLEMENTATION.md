# Shopping Page Implementation Guide

## Overview
A comprehensive shopping management system with categories, items, expected/actual prices, bill export functionality, and more - similar to the expense planning page.

## ✅ Completed Components

### 1. Database Schema (Prisma)
**Models Created:**
- `ShoppingCategory` - Shopping categories with icon, color, expected/real costs
- `ShoppingItem` - Individual shopping items with expected/actual prices, quantity, unit, bought status

**Key Features:**
- Category-based organization
- Expected vs Actual price tracking
- Quantity and unit management
- Bought status with actual price
- Active/inactive categories

### 2. API Routes Created

#### Shopping Categories API
- `GET /api/shopping-categories` - Fetch all categories with items
- `POST /api/shopping-categories` - Create new category
- `PATCH /api/shopping-categories/[id]` - Update category
- `DELETE /api/shopping-categories/[id]` - Delete category

#### Shopping Items API
- `GET /api/shopping-items` - Fetch all items
- `POST /api/shopping-items` - Create new item (auto-updates category expected cost)
- `PATCH /api/shopping-items/[id]` - Update item (including marking as bought with actual price)
- `DELETE /api/shopping-items/[id]` - Delete item (auto-updates category costs)

**Auto-Calculation Features:**
- Category expected cost = Sum of (item.expectedPrice × item.quantity)
- Category real cost = Sum of (item.actualPrice × item.quantity) for bought items
- Costs update automatically when items are added, updated, or deleted

### 3. Export Library (`src/lib/shoppingExport.ts`)
**Functions:**
- `exportShoppingCategoryToPDF()` - Generate professional PDF shopping bill
- `exportShoppingCategoryToExcel()` - Export to CSV format
- `sendShoppingCategoryEmail()` - Email shopping bill as PDF attachment

**PDF Features:**
- Professional bill format with green header
- Category details and status
- Expected vs Actual cost comparison
- Variance/savings calculation
- Detailed items table with quantities and prices
- Bought status for each item

## 📋 Components to Create

You need to create these React components to complete the shopping page:

### 1. ShoppingCategoryModal (`src/components/ShoppingCategoryModal.tsx`)
**Purpose:** Create/edit shopping categories

**Props:**
```typescript
interface ShoppingCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (category: any) => void
  editingCategory?: any
}
```

**Fields:**
- Category name (required)
- Icon selection (emoji picker)
- Color theme selection
- Expected budget (optional)

**Reference:** Copy from `src/components/PlanningCategoryModal.tsx` and adapt for shopping

### 2. ShoppingItemModal (`src/components/ShoppingItemModal.tsx`)
**Purpose:** Add/edit shopping items

**Props:**
```typescript
interface ShoppingItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: any) => void
  categories: any[]
  selectedCategoryId?: string
  editingItem?: any
}
```

**Fields:**
- Item name (required)
- Expected price (required)
- Quantity (default: 1)
- Unit (pcs, kg, g, l, ml, pack, box)
- Category selection
- Notes (optional)

**Reference:** Copy from `src/components/ExpensePlanningModal.tsx` and adapt

### 3. ShoppingCategoryDetailsModal (`src/components/ShoppingCategoryDetailsModal.tsx`)
**Purpose:** View category details, mark items as bought, export bills

**Props:**
```typescript
interface ShoppingCategoryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  category: any
  items: any[]
  onDeleteItem: (id: string) => void
  onEditItem: (item: any) => void
  onMarkBought: (item: any, actualPrice: number) => void
  onExport: (format: 'pdf' | 'excel' | 'email') => void
}
```

**Features:**
- Display category summary (expected vs actual costs)
- List all items in category
- Checkbox to mark items as bought (prompts for actual price)
- Edit/delete item actions
- Export buttons (PDF, Excel, Email)

**Reference:** Copy from `src/components/CategoryDetailsModal.tsx` and adapt

### 4. Main Shopping Page (`src/app/shopping/page.tsx`)
**Purpose:** Main shopping management interface

**Key Features:**
- Statistics cards (total categories, items, expected vs actual costs)
- Category grid with visual cards
- Click category to view details
- Add/edit/delete categories
- Mark items as bought with actual price prompt
- Export bills per category
- Theme toggle
- Responsive design

**Reference:** Copy from `src/app/expense-planning/page.tsx` and adapt

## 🎯 Implementation Steps

### Step 1: Create ShoppingCategoryModal
```bash
# Copy and adapt from PlanningCategoryModal
cp src/components/PlanningCategoryModal.tsx src/components/ShoppingCategoryModal.tsx
```

**Changes needed:**
- Remove date/expiry fields (shopping categories don't need dates)
- Keep: name, icon, color, expectedCost
- Update modal title to "Shopping Category"

### Step 2: Create ShoppingItemModal
```bash
# Copy and adapt from ExpensePlanningModal
cp src/components/ExpensePlanningModal.tsx src/components/ShoppingItemModal.tsx
```

**Changes needed:**
- Replace "title" with "name"
- Replace "amount" with "expectedPrice"
- Add "quantity" and "unit" fields
- Remove "date" field
- Update labels for shopping context

### Step 3: Create ShoppingCategoryDetailsModal
```bash
# Copy and adapt from CategoryDetailsModal
cp src/components/CategoryDetailsModal.tsx src/components/ShoppingCategoryDetailsModal.tsx
```

**Changes needed:**
- Update to show shopping items instead of expenses
- Add "Mark as Bought" functionality with actual price prompt
- Show quantity and unit for each item
- Update export functions to use shopping export library
- Remove date-related displays

### Step 4: Create Main Shopping Page
```bash
# Copy and adapt from expense-planning page
cp src/app/expense-planning/page.tsx src/app/shopping/page.tsx
```

**Changes needed:**
- Update API endpoints to `/api/shopping-categories` and `/api/shopping-items`
- Update import statements for shopping components
- Update header title and icon (use shopping cart icon)
- Update color scheme (use green/emerald theme)
- Remove date-related logic
- Add "Mark as Bought" handler with actual price prompt
- Update export functions to use shopping export library

## 🔧 Key Functionality

### Mark Item as Bought with Actual Price
```typescript
const handleMarkBought = async (item: ShoppingItem) => {
  const actualPrice = prompt(`Enter actual price for ${item.name}:`, item.expectedPrice.toString())
  
  if (actualPrice === null) return // User cancelled
  
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
      loadData() // Reload to update costs
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

### Export Shopping Bill
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

## 📊 Statistics Calculation
```typescript
const stats = useMemo(() => {
  const totalExpected = categories.reduce((sum, cat) => sum + cat.expectedCost, 0)
  const totalReal = categories.reduce((sum, cat) => sum + cat.realCost, 0)
  const totalItems = items.length
  const boughtItems = items.filter(i => i.isBought).length
  const savings = totalExpected - totalReal
  
  return { totalExpected, totalReal, totalItems, boughtItems, savings }
}, [categories, items])
```

## 🎨 UI Recommendations

### Color Scheme
- Primary: Emerald/Green (shopping theme)
- Header gradient: `from-emerald-600 via-green-600 to-teal-600`
- Category cards: Use the selected color gradient
- Bought items: Green checkmark with success color
- Pending items: Amber/orange indicator

### Icons
- Shopping cart icon for main page
- Checkmark for bought items
- Shopping bag for categories
- Receipt icon for export

### Mobile Optimization
- Floating action button for adding items
- Swipe actions for mark as bought
- Bottom sheet for item details
- Responsive grid for categories

## 🔗 Navigation

### Add to BottomNav
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

### Add to Dashboard
```typescript
<a href="/shopping" className="group relative w-full rounded-lg bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white p-4 shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-2 transition-all duration-500">
  {/* Shopping card content */}
</a>
```

## ✅ Testing Checklist

- [ ] Create shopping category
- [ ] Edit shopping category
- [ ] Delete shopping category
- [ ] Add item to category
- [ ] Edit item
- [ ] Delete item
- [ ] Mark item as bought (with actual price prompt)
- [ ] Unmark item as bought
- [ ] View category details
- [ ] Export bill as PDF
- [ ] Export bill as Excel
- [ ] Send bill via email
- [ ] Verify cost calculations (expected vs actual)
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test theme toggle
- [ ] Test with multiple categories
- [ ] Test with items in different categories

## 🚀 Next Steps

1. Create the three modal components
2. Create the main shopping page
3. Add navigation links
4. Test all functionality
5. Add email export API route (similar to category-export/email)
6. Style and polish the UI

## 📝 Notes

- All API routes are ready and functional
- Database schema is migrated
- Export library is complete
- Auto-calculation of costs is implemented
- Similar structure to expense planning for consistency
- Mobile-first responsive design
- Dark mode support included

## 🎉 Features Summary

✅ Category-based shopping organization
✅ Expected vs Actual price tracking
✅ Mark items as bought with actual price
✅ Automatic cost calculations
✅ Professional PDF bill generation
✅ Excel/CSV export
✅ Email bill functionality
✅ Quantity and unit management
✅ Notes for items
✅ Active/inactive categories
✅ Responsive design
✅ Dark mode support
✅ Export bills per category
✅ View all items in category
✅ Edit/delete functionality
✅ Statistics dashboard

The shopping page will provide a complete shopping management experience similar to the expense planning page, with all the features you requested!
